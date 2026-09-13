import dotenv from 'dotenv';
import mongoose from 'mongoose';
import sharp from 'sharp';
import { mkdir, writeFile } from 'node:fs/promises';
import Company from '../models/Company.js';
import JobSource from '../models/JobSource.js';
import { readPublicBranding } from '../services/jobs/companyBranding.service.js';
import { assertSafeRemoteHost } from '../utils/jobValidation.js';
dotenv.config({quiet:true});
const apply = process.argv.includes('--apply');
try {
  await mongoose.connect(process.env.MONGO_URI, {serverSelectionTimeoutMS:10000});
  const companies = await Company.find({logo:{$in:['',null]}, overrideFields:{$ne:'logo'}}).lean();
  const sources = new Map((await JobSource.find({}).lean()).map(s=>[String(s._id),s]));
  const rows=[];
  // Sequential: one career page and one image check at a time; no evasion/retries.
  for (const company of companies) {
    const source=sources.get(String(company.source));
    let url=company.careersUrl || source?.careersUrl;
    if (!url) continue;
    if(source?.type==='teamtailor') url=new URL('/jobs',url).href;
    if(source?.type==='workable' && !url.endsWith('/')) url+='/';
    const row={companyId:String(company._id),company:company.name,checkedAt:new Date(),pageUrl:url};
    try {
      Object.assign(row, await readPublicBranding(url));
      if(row.logo) {
        await assertSafeRemoteHost(row.logo);
        const image=await fetch(row.logo,{redirect:'error',signal:AbortSignal.timeout(15000)});
        if(!image.ok) throw new Error(`Logo returned HTTP ${image.status}`);
        if(Number(image.headers.get('content-length'))>3000000) throw new Error('Logo exceeds size limit');
        const chunks=[];let length=0;
        for await(const chunk of image.body) {length+=chunk.length;if(length>3000000) throw new Error('Logo exceeds size limit');chunks.push(chunk);}
        const metadata=await sharp(Buffer.concat(chunks),{limitInputPixels:16000000}).metadata();
        if(!metadata.width || !metadata.height) throw new Error('Logo is not a valid image');
        row.verified=true;
        if(apply) { const result=await Company.updateOne({_id:company._id,logo:{$in:['',null]},overrideFields:{$ne:'logo'}},{$set:{logo:row.logo}});row.updated=result.modifiedCount===1; }
      } else row.reason='No explicit employer logo found';
    } catch(error) {row.reason=error.message;}
    rows.push(row);
    console.log(JSON.stringify({company:row.company,updated:row.updated,verified:row.verified,reason:row.reason}));
  }
  const directory=new URL('../../../exports/company-logo-enrichment/',import.meta.url);await mkdir(directory,{recursive:true});
  await writeFile(new URL(`report-${Date.now()}.json`,directory),JSON.stringify({apply,checkedAt:new Date(),rows},null,2));
  console.log(JSON.stringify({checked:rows.length,verified:rows.filter(r=>r.verified).length,updated:rows.filter(r=>r.updated).length}));
} catch(error) {console.error(error.message);process.exitCode=1;} finally {await mongoose.disconnect();}
