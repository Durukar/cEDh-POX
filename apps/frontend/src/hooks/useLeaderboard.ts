import { useQuery } from '@tanstack/react-query'
import { fetchLeaderboard } from '../lib/api'

export function useLeaderboard() {
  return useQuery({
    queryKey: ['leaderboard'],
    queryFn: fetchLeaderboard,
    refetchInterval: 60_000,
  })
}
