import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { ArrowLeft } from 'lucide-react';

export function DetailPageHeader({ 
  icon: Icon, 
  title, 
  subtitle,
  onBack,
  backLabel = "Back",
  actions 
}) {
  return (
    <>
      {/* Back Button */}
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={onBack}
          className="gap-2 -ml-2"
        >
          <ArrowLeft className="w-4 h-4" />
          {backLabel}
        </Button>
      </div>

      {/* Header Card */}
      <Card className="border-gray-200 mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gray-900 rounded-xl flex items-center justify-center">
                <Icon className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
                {subtitle && (
                  <p className="text-gray-500 mt-1 flex items-center gap-2">
                    {subtitle}
                  </p>
                )}
              </div>
            </CardTitle>
            {actions && <div className="flex items-center gap-3">{actions}</div>}
          </div>
        </CardHeader>
      </Card>
    </>
  );
}
