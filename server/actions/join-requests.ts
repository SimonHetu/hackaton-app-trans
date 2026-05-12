"use server";

export async function createJoinRequest(input: { teamId: string; message?: string }) {
  // STUB temporaire — sera remplacé par le back
  console.log("TODO createJoinRequest", input);
  // Retourne { checkoutUrl: string } si tournoi payant, sinon undefined
  return undefined;
}

export async function cancelJoinRequest(requestId: string) {
  // STUB temporaire — sera remplacé par le back
  console.log("TODO cancelJoinRequest", requestId);
}