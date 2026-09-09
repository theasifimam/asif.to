import { GenericApiJobProvider } from "./genericApi.provider.js";
import { ManualJobProvider } from "./manual.provider.js";
import { GreenhouseJobProvider } from "./greenhouse.provider.js";
import { LeverJobProvider } from "./lever.provider.js";
import { SmartRecruitersJobProvider } from "./smartRecruiters.provider.js";
import { WorkableJobProvider } from "./workable.provider.js";
import { AshbyJobProvider } from "./ashby.provider.js";

export function providerForSource(source, options) {
  if (source.type === "manual") return new ManualJobProvider(source, options);
  if (source.type === "greenhouse") return new GreenhouseJobProvider(source, options);
  if (source.type === "lever") return new LeverJobProvider(source, options);
  if (source.type === "smartrecruiters") return new SmartRecruitersJobProvider(source, options);
  if (source.type === "workable") return new WorkableJobProvider(source, options);
  if (source.type === "ashby") return new AshbyJobProvider(source, options);
  if (["api", "employer-career-page", "other"].includes(source.type) && source.endpointUrl) return new GenericApiJobProvider(source, options);
  throw new Error(`The ${source.type} provider is not configured yet. Add an endpoint URL or a dedicated adapter.`);
}
