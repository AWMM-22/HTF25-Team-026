import Navbar from '@/components/Navbar';
import SiteFooter from '@/components/SiteFooter';
import { Input } from '@/components/ui/input';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card, CardContent } from '@/components/ui/card';

const faqs = [
  { q: 'How to report an issue?', a: 'Go to Report, add title, description, location, and upload media. Submit to create a new issue.' },
  { q: 'Can I report anonymously?', a: 'Yes, you can toggle privacy in Settings to hide your identity on public pages.' },
  { q: 'How long until an issue is resolved?', a: 'Resolution times vary by category and ward. You can track status changes and updates on the issue page.' },
  { q: 'How do authorities verify reports?', a: 'Officials verify with on-ground checks and media. Verified status appears in the issue timeline.' },
  { q: 'What data do you store?', a: 'We store report details, media, and optional profile data. See Privacy for full details.' },
];

export default function FAQ() {
  return (
    <div className="min-h-screen bg-transparent">
      <Navbar />
      <main className="pt-28 max-w-5xl mx-auto px-6">
        <h1 className="text-4xl font-bold mb-4">Help / FAQ</h1>
        <Card className="border-primary/20">
          <CardContent className="p-6">
            <div className="mb-6">
              <Input placeholder="Search questions..." />
            </div>
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((f, i) => (
                <AccordionItem key={i} value={`item-${i}`}>
                  <AccordionTrigger>{f.q}</AccordionTrigger>
                  <AccordionContent>{f.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      </main>
      <SiteFooter />
    </div>
  );
}
