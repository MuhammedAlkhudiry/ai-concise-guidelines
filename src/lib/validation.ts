import { z } from "zod";

import type { RemoteSkillSource } from "../../config/skills";

const remoteSkillSchema = z.object({
  name: z.string().min(1),
  sourcePath: z.string().min(1),
});

const remoteSkillSourceSchema = z.object({
  repository: z.string().url(),
  ref: z.string().min(1),
  skills: z.array(remoteSkillSchema).min(1),
});

const remoteSkillSourcesSchema = z.array(remoteSkillSourceSchema);

export function validateRemoteSkillSources(sources: RemoteSkillSource[]): RemoteSkillSource[] {
  return remoteSkillSourcesSchema.parse(sources);
}
