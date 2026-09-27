import ShareTargetReceiver from "../../components/ShareTargetReceiver";

export default async function ShareTargetPage({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  const params = await searchParams;
  const parsed = params.id ? Number(params.id) : NaN;
  return <ShareTargetReceiver id={Number.isFinite(parsed) ? parsed : null} />;
}
