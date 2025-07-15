"use client";

import { Button } from "@/components/ui/button";
import { 
  ArrowRightIcon, 
  CheckCircleIcon, 
  MailIcon, 
  UserCogIcon 
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface GmailConnectionBannerProps {
  isGmailConnected: boolean;
  checkingGmailConnection: boolean;
}

export const GmailConnectionBanner = ({
  isGmailConnected,
  checkingGmailConnection,
}: GmailConnectionBannerProps) => {
  if (isGmailConnected || checkingGmailConnection) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-6 mb-6 shadow-sm">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="bg-white p-3 rounded-full shadow-sm">
            <Image src="/gmail.svg" alt="Gmail" width={28} height={28} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-800 mb-1">Connect your Gmail account</h3>
            <p className="text-slate-600 max-w-xl">
              Connect your Gmail account to send automatic invoice reminders to clients. Increase your chances of getting paid on time with personalized email reminders.
            </p>
          </div>
        </div>
        <Link href="/connect" className="flex-shrink-0">
          <Button className="bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 shadow-sm px-5 py-2 h-auto flex items-center gap-2 group transition-all duration-200">
            <Image src="/gmail.svg" alt="Gmail" width={20} height={20} className="mr-2" />
            <span>Connect Gmail</span>
            <ArrowRightIcon className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-1" />
          </Button>
        </Link>
      </div>
      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white/60 p-3 rounded-lg flex items-start gap-3">
          <div className="bg-blue-100 p-1.5 rounded-lg">
            <MailIcon className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <h4 className="font-medium text-sm">Automated Reminders</h4>
            <p className="text-xs text-slate-500 mt-1">Send timely payment reminders without any manual effort</p>
          </div>
        </div>
        <div className="bg-white/60 p-3 rounded-lg flex items-start gap-3">
          <div className="bg-purple-100 p-1.5 rounded-lg">
            <UserCogIcon className="h-4 w-4 text-purple-600" />
          </div>
          <div>
            <h4 className="font-medium text-sm">Personalized Templates</h4>
            <p className="text-xs text-slate-500 mt-1">Choose from polite, firm, or urgent reminder templates</p>
          </div>
        </div>
        <div className="bg-white/60 p-3 rounded-lg flex items-start gap-3">
          <div className="bg-green-100 p-1.5 rounded-lg">
            <CheckCircleIcon className="h-4 w-4 text-green-600" />
          </div>
          <div>
            <h4 className="font-medium text-sm">Faster Payments</h4>
            <p className="text-xs text-slate-500 mt-1">Get paid 55% faster with automatic follow-ups</p>
          </div>
        </div>
      </div>
    </div>
  );
};