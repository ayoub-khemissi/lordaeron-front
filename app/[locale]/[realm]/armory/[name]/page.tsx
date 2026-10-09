import { CharacterProfile } from "./character-profile";

export default async function CharacterPage({
  params,
}: {
  params: Promise<{ name: string }>;
}) {
  const { name } = await params;

  return <CharacterProfile name={name} />;
}
