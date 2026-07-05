import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, ExternalLink, Link as LinkIcon, UserPlus, CreditCard } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function PublicLinks() {
  const { toast } = useToast();
  
  const getBaseUrl = () => {
    // Dynamically extract the base URL by removing the current route path.
    // This ensures it works perfectly even if deployed in a subdirectory.
    return window.location.href.split('/maintenance')[0];
  };

  const links = [
    {
      title: 'Public Admission Form',
      description: 'Share this link with new students to fill out their admission details online.',
      path: '/admission',
      icon: UserPlus,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Public Payment Confirmation',
      description: 'Share this link with students to submit and verify their monthly rent payments via UTR.',
      path: '/payment-confirm',
      icon: CreditCard,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100',
    }
  ];

  const handleCopy = (path: string) => {
    const fullUrl = `${getBaseUrl()}${path}`;
    navigator.clipboard.writeText(fullUrl);
    toast({
      title: 'Link Copied!',
      description: 'The public link has been copied to your clipboard.',
    });
  };

  const handleOpen = (path: string) => {
    const fullUrl = `${getBaseUrl()}${path}`;
    window.open(fullUrl, '_blank');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Public Links</h1>
      </div>
      
      <p className="text-muted-foreground">
        These are the publicly accessible links that you can share with students and parents. They do not require a login.
      </p>

      <div className="grid gap-6 md:grid-cols-2">
        {links.map((link, index) => {
          const Icon = link.icon;
          const fullUrl = `${getBaseUrl()}${link.path}`;
          
          return (
            <Card key={index} className="overflow-hidden">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className={`p-2 rounded-lg ${link.bgColor}`}>
                    <Icon className={`h-6 w-6 ${link.color}`} />
                  </div>
                  <CardTitle className="text-xl">{link.title}</CardTitle>
                </div>
                <CardDescription>{link.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-3 pt-2">
                  <Button variant="outline" className="flex-1 border-primary/20 hover:bg-primary/5" onClick={() => handleCopy(link.path)}>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Link
                  </Button>
                  <Button className="flex-1 shadow-md" onClick={() => handleOpen(link.path)}>
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Open Page
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
