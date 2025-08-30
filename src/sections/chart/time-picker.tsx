"use client";

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { PropsWithChildren, FC } from "react";

export const SelectDateView = ({
  timeRange,
  setTimeRange,
}: {
  timeRange: string;
  setTimeRange: (s: string) => void;
}) => {
  return (
    <RadioGroup
      className="bg-muted border flex flex-row rounded-full py-1.25"
      value={timeRange}
      onValueChange={setTimeRange}
    >
      <SelectDateViewItem interval="daily"> 24H</SelectDateViewItem>
      <SelectDateViewItem interval="weekly"> 7D</SelectDateViewItem>
      <SelectDateViewItem interval="monthly"> 30D</SelectDateViewItem>
    </RadioGroup>
  );
};

const SelectDateViewItem: FC<PropsWithChildren & { interval: string }> = ({
  interval,
  children,
}) => (
  <div className="flex gap-2 justify-center items-center relative rounded-full px-1 cursor-pointer">
    <RadioGroupItem value={interval} id={interval} className="sr-only peer" />
    <Label
      htmlFor={interval}
      className="dark:peer-data-[state=checked]:bg-primary-foreground  dark:peer-data-[state=checked]:border-primary peer-data-[state=checked]:border-1 border-0 peer-data-[state=checked]:text-primary-foreground dark:peer-data-[state=checked]:text-primary peer-data-[state=checked]:bg-primary text-xs rounded-full py-1 px-2 transition-colors"
    >
      {children}
    </Label>
  </div>
);