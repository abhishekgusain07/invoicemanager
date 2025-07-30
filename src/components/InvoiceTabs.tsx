import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"

interface TabItem {
  value: string;
  label: string;
  content: React.ReactNode;
}

interface InvoiceTabsProps {
  defaultValue?: string;
  tabs: TabItem[];
  className?: string;
}

export default function InvoiceTabs({ 
  defaultValue, 
  tabs, 
  className = "w-full" 
}: InvoiceTabsProps) {
  return (
    <Tabs defaultValue={defaultValue || tabs[0]?.value} className={className}>
      <TabsList className="grid w-full grid-cols-4">
        {tabs.map((tab) => (
          <TabsTrigger key={tab.value} value={tab.value}>
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {tabs.map((tab) => (
        <TabsContent key={tab.value} value={tab.value} className="mt-4">
          {tab.content}
        </TabsContent>
      ))}
    </Tabs>
  )
}
