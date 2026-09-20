import { getStats } from "../../lib/stats";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
	const params = new URL(request.url).searchParams;

	const scopeParam = params.get("scope");
	const scope =
		scopeParam === "lifetime" || scopeParam === "stream"
			? scopeParam
			: undefined;

	const sinceParam = params.get("since");
	const parsedSince = sinceParam ? new Date(sinceParam) : null;
	const since =
		parsedSince && !Number.isNaN(parsedSince.getTime())
			? parsedSince
			: undefined;

	try {
		return Response.json(await getStats({ scope, since }));
	} catch {
		return Response.json({ error: "Failed to read stats" }, { status: 500 });
	}
}
