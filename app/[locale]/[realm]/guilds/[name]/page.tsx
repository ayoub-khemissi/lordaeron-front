import { GuildProfile } from "./guild-profile";

export default async function GuildPage({
  params,
}: {
  params: Promise<{ name: string }>;
}) {
  const { name } = await params;

  return <GuildProfile name={decodeURIComponent(name)} />;
}
