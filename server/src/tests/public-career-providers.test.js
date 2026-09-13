import test from 'node:test';
import assert from 'node:assert/strict';
import {providerForSource} from '../services/jobs/providers/index.js';
import {detectJobBoard} from '../services/jobs/jobSourceDiscovery.service.js';
import {extractCompanyLogo,readPublicBranding} from '../services/jobs/companyBranding.service.js';

test('three public providers resolve board IDs and use the existing UAE normalizer',async()=>{
  for(const [url,body,type] of [
    ['https://employer.recruitee.com',{offers:[{id:1,title:'Engineer',status:'published',location:'Al Ain',country_code:'AE'},{id:2,location:'London',country_code:'GB'},{id:3,status:'draft',location:'Dubai'}]},'recruitee'],
    ['https://employer.pinpointhq.com',{data:[{id:1,title:'Engineer',location:{name:'United Arab Emirates - Fujairah'}},{id:2,location:{name:'London'}}]},'pinpoint'],
    ['https://employer.teamtailor.com','<rss xmlns:tt="https://teamtailor.com/locations"><channel><item><guid>1</guid><title>Engineer</title><description>Work with us</description><tt:locations><tt:location><tt:city>Ajman</tt:city><tt:country>United Arab Emirates</tt:country></tt:location></tt:locations></item><item><guid>2</guid><tt:locations><tt:location><tt:city>London</tt:city></tt:location></tt:locations></item></channel></rss>','teamtailor'],
  ]) {
    const source={name:'Employer',...detectJobBoard(url)};assert.equal(source.type,type);assert.equal(source.providerOrganizationId,'employer');
    const provider=providerForSource(source,{validateRemoteHost:false,fetchImpl:async()=>({ok:true,json:async()=>body,text:async()=>body})});
    const jobs=await provider.fetchJobs();assert.equal(jobs.length,1);assert.equal(provider.lastFetchStats.jobsFound,2);assert.equal(provider.normalizeJob(jobs[0]).companyName,'Employer');
  }
});
test('malformed public feeds and XML entities are rejected',async()=>{
  for(const url of ['https://employer.recruitee.com','https://employer.pinpointhq.com','https://employer.teamtailor.com']){
    const p=providerForSource(detectJobBoard(url),{validateRemoteHost:false,fetchImpl:async()=>({ok:true,json:async()=>({}),text:async()=>'<!DOCTYPE rss [<!ENTITY x SYSTEM "file:///etc/passwd">]><rss/>'})});
    await assert.rejects(p.fetchJobs());
  }
});
test('company logos come from explicit public branding, not ATS footer logos or guessed favicons',()=>{
  assert.equal(extractCompanyLogo('<img alt="Lever logo" src="/img/lever-logo.svg">','https://jobs.lever.co/acme'),'');
  assert.equal(extractCompanyLogo('<img alt="Acme logo" src="https://cdn.example/acme.png">','https://jobs.lever.co/acme'),'https://cdn.example/acme.png');
  assert.equal(extractCompanyLogo('<script>{"logoSquareImageUrl":"https://cdn.example/acme.png"}</script>','https://jobs.ashbyhq.com/acme'),'https://cdn.example/acme.png');
  assert.equal(extractCompanyLogo('<img alt="Acme logo" src="javascript:alert(1)">','https://example.com'),'');
  assert.equal(extractCompanyLogo('<img alt="logo">','https://example.com'),'');
});
test('branding does not retry or bypass forbidden career pages',async()=>{
  let calls=0;
  await assert.rejects(readPublicBranding('https://example.com',{validateRemoteHost:false,fetchImpl:async()=>{calls++;return{ok:false,status:403};}}),/403/);
  assert.equal(calls,1);
});
