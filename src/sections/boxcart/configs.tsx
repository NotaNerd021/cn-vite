import { TabsContent } from "@/components/ui/tabs"; 
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const ConfigsTab = () => {
  return (
    <TabsContent value="configs">
      <Card>
        <CardHeader>
          <CardTitle>Password</CardTitle>
          <CardDescription>
            Make changes to your account here. Click save when you&#39;re done.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2"></CardContent>
        <CardFooter></CardFooter>
      </Card>
    </TabsContent>
  );
};

export default ConfigsTab;
