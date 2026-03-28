// src/components/SkeletonList.tsx
import { Stack, Skeleton } from "@mui/material";

export default function SkeletonList() {
  return (
    <Stack spacing={2}>
      {[...Array(5)].map((_, i) => (
        <div key={i}>
          <Skeleton width={140} height={16} />
          {[...Array(3)].map((_, j) => (
            <Skeleton key={j} height={24} />
          ))}
        </div>
      ))}
    </Stack>
  );
}
