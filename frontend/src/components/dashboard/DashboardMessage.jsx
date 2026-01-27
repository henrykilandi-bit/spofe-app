import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const LEVEL_STYLES = {
  success: "border-spofe-success text-spofe-success",
  warning: "border-spofe-warning text-spofe-warning",
  danger: "border-spofe-danger text-spofe-danger",
};

export default function DashboardMessage({ level, message }) {
  return (
    <Alert className={LEVEL_STYLES[level]}>
      <AlertTitle>Situation actuelle</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}
