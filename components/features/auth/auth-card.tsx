import { FC } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AuthCardProps } from "./types";

export const AuthCard: FC<AuthCardProps> = ({
  title,
  heading,
  description,
  children,
}) => {
  return (
    <Card className="w-[350px]">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-2">{title}</div>
        {heading && (
          <CardTitle className="text-xl font-semibold">{heading}</CardTitle>
        )}
        {description && (
          <CardDescription className="text-sm text-muted-foreground mt-1.5">
            {description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
};
