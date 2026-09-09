import { JobProvider } from "./base.provider.js";

export class ManualJobProvider extends JobProvider {
  async fetchJobs() {
    return [];
  }
}

