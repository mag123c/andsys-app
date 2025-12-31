import { WifiOff } from "lucide-react";

export default function OfflinePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="text-center space-y-4">
        <WifiOff className="mx-auto h-16 w-16 text-muted-foreground" />
        <h1 className="text-2xl font-bold text-foreground">
          오프라인 상태입니다
        </h1>
        <p className="text-muted-foreground max-w-md">
          인터넷 연결이 끊어졌습니다. 연결이 복구되면 자동으로 다시 접속됩니다.
        </p>
        <p className="text-sm text-muted-foreground">
          이미 열어둔 페이지에서는 계속 작업할 수 있습니다.
        </p>
      </div>
    </div>
  );
}
