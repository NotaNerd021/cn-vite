"use client";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerClose,
} from "@/components/ui/drawer";
import React from "react";
import { useTranslation } from "react-i18next";
import { CheckIcon, ChevronDownIcon, GlobeIcon, XIcon } from "lucide-react";

const languages = [
  { code: "fa", label: "Persian" },
  { code: "en", label: "English" },
];

const flagIcons = {
  fa: "🇮🇷",
  en: "🇺🇸",
};

export default function LanguageSelector() {
  const { i18n } = useTranslation();

  const handleLanguageChange = (newLanguage: string) => {
    i18n.changeLanguage(newLanguage);
  };

  return (
    <React.Fragment>
      {/* Desktop Language Selector */}
      <div className="hidden sm:flex items-center justify-center">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              {<GlobeIcon />} <span>{i18n.language}</span>
              <ChevronDownIcon className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {languages.map((lang) => (
              <DropdownMenuItem
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                className="flex items-center justify-between cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  {flagIcons[lang.code as keyof typeof flagIcons]} {lang.label}
                </span>
                {i18n.language === lang.code && (
                  <CheckIcon className="h-5 w-5" />
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Mobile Language Selector */}
      <div className="flex justify-center md:hidden">
        <Drawer>
          <DrawerTrigger asChild>
            <Button variant="outline">
              {flagIcons[i18n.language as keyof typeof flagIcons]}{" "}
              <span>{i18n.language}</span>
              <ChevronDownIcon className="h-4 w-4" />
            </Button>
          </DrawerTrigger>
          <DrawerContent>
            <div className="grid gap-4 p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Select Language</h3>
                <DrawerClose asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <XIcon className="h-5 w-5" />
                  </Button>
                </DrawerClose>
              </div>
              <div className="grid gap-2">
                {languages.map((lang) => (
                  <Button
                    key={lang.code}
                    variant="ghost"
                    className="justify-start gap-2"
                    onClick={() => handleLanguageChange(lang.code)}
                  >
                    {flagIcons[lang.code as keyof typeof flagIcons]}{" "}
                    <span>{lang.label}</span>
                    {i18n.language === lang.code && (
                      <CheckIcon className="h-5 w-5 ml-auto" />
                    )}
                  </Button>
                ))}
              </div>
            </div>
          </DrawerContent>
        </Drawer>
      </div>
    </React.Fragment>
  );
}
