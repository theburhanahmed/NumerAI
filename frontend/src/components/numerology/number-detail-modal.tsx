/**
 * NumberDetailModal component - Display detailed interpretation of a number.
 */
'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { NumberInterpretation } from '@/types/numerology';

interface NumberDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  interpretation: NumberInterpretation | null;
  numberName: string;
}

export function NumberDetailModal({
  open,
  onOpenChange,
  interpretation,
  numberName,
}: NumberDetailModalProps) {
  if (!interpretation) return null;

  const isMasterNumber = [11, 22, 33].includes(interpretation.number);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="text-5xl font-bold text-purple-600">
              {interpretation.number}
            </div>
            <div>
              <DialogTitle className="text-2xl">{numberName}</DialogTitle>
              <DialogDescription className="text-lg font-semibold">
                {interpretation.title}
                {isMasterNumber && (
                  <Badge variant="secondary" className="ml-2">
                    Master Number
                  </Badge>
                )}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="mt-6">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="strengths">Strengths</TabsTrigger>
              <TabsTrigger value="challenges">Challenges</TabsTrigger>
              <TabsTrigger value="career">Career</TabsTrigger>
              <TabsTrigger value="relationships">Love</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4 mt-4">
              <div>
                <h3 className="font-semibold text-lg mb-2">Description</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {interpretation.description}
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Life Purpose</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {interpretation.life_purpose}
                </p>
              </div>
            </TabsContent>

            <TabsContent value="strengths" className="mt-4">
              <h3 className="font-semibold text-lg mb-3">Your Strengths</h3>
              <ul className="space-y-2">
                {interpretation.strengths.map((strength, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-green-600 mt-1">✓</span>
                    <span className="text-muted-foreground">{strength}</span>
                  </li>
                ))}
              </ul>
            </TabsContent>

            <TabsContent value="challenges" className="mt-4">
              <h3 className="font-semibold text-lg mb-3">Challenges to Overcome</h3>
              <ul className="space-y-2">
                {interpretation.challenges.map((challenge, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-amber-600 mt-1">⚠</span>
                    <span className="text-muted-foreground">{challenge}</span>
                  </li>
                ))}
              </ul>
            </TabsContent>

            <TabsContent value="career" className="mt-4">
              <h3 className="font-semibold text-lg mb-3">Career Paths</h3>
              <div className="grid grid-cols-2 gap-3">
                {interpretation.career.map((career, index) => (
                  <div
                    key={index}
                    className="p-3 bg-secondary rounded-lg text-center"
                  >
                    {career}
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="relationships" className="mt-4">
              <h3 className="font-semibold text-lg mb-3">Relationships & Love</h3>
              <p className="text-muted-foreground leading-relaxed">
                {interpretation.relationships}
              </p>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}