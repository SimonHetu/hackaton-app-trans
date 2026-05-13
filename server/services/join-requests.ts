import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

type CompletedJoinRequestsResult = {
  teamIds: string[];
};

export async function completePaidJoinRequests(
  joinRequestIds: string[],
  stripeSessionId: string,
): Promise<CompletedJoinRequestsResult> {
  const uniqueJoinRequestIds = [...new Set(joinRequestIds)];

  if (uniqueJoinRequestIds.length === 0) {
    return { teamIds: [] };
  }

  return prisma.$transaction(
    async (tx) => {
      const joinRequests = await tx.joinRequest.findMany({
        where: { id: { in: uniqueJoinRequestIds } },
        select: { id: true, playerId: true, teamId: true },
      });

      const teamIds = [...new Set(joinRequests.map((request) => request.teamId))];

      if (teamIds.length === 0) {
        return { teamIds: [] };
      }

      await tx.$queryRaw`
        SELECT id FROM "Team" WHERE id IN (${Prisma.join(teamIds)}) FOR UPDATE
      `;

      await tx.joinRequest.updateMany({
        where: { id: { in: joinRequests.map((request) => request.id) } },
        data: {
          status: "ACCEPTED",
          paymentStatus: "PAID",
          stripeSessionId,
          paidAt: new Date(),
        },
      });

      for (const request of joinRequests) {
        await tx.$executeRaw`
          INSERT INTO "_TeamMembers" ("A", "B")
          VALUES (${request.teamId}, ${request.playerId})
          ON CONFLICT DO NOTHING
        `;
      }

      return { teamIds };
    },
    { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
  );
}
