import { NextRequest, NextResponse } from "next/server";

import { nanoid } from "nanoid";

import {
  getPublicKey,
  getEventHash,
  getSignature,
  SimplePool,
} from "nostr-tools";

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");

  if (url === null) {
    return NextResponse.json({ error: "no url, /get/?url=<full url here>" });
  }

  const relays = process.env.NEXT_PUBLIC_RELAY_URLS?.split(",") || [
    "wss://relay.damus.io",
    "wss://relay.nostr.band",
  ];

  const pool = new SimplePool();

  const sk = process.env.NEXT_PUBLIC_SK;

  if (sk === undefined) {
    return NextResponse.json({ error: "no secret key" });
  }

  let pk = getPublicKey(sk);

  const id = nanoid(8);

  let event = {
    pubkey: pk,
    kind: 1994,
    created_at: Math.floor(Date.now() / 1000),
    tags: [
      ["d", id],
      ["r", url],
    ],
    content: "",
    id: "",
    sig: "",
  };

  event.id = getEventHash(event);
  event.sig = getSignature(event, sk);

  pool.publish(relays, event);

  return NextResponse.json({
    id: id,
    url: `https://w3.do/${id}`,
    eid: event.id,
  });
}
