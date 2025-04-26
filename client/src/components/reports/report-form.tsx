import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { UserRole } from '@shared/schema';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format, addDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subMonths, isBefore } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

type ReportFormProps = {
  onSubmit: (values: {
    childId: number;
    reportType: string;
    dateRange: string;
    startDate: Date;
    endDate: Date;
  }) => void;
};

export const ReportForm = ({ onSubmit }: ReportFormProps) => {
  const { t } = useTranslation();
  const [dateRange, setDateRange] = useState<string>('thisMonth');
  const [isCustomRange, setIsCustomRange] = useState(false);

  // Fetch family members to get children
  const { data: familyMembers, isLoading } = useQuery({
    queryKey: ['/api/family/members'],
  });

  const formSchema = z.object({
    childId: z.coerce.number().min(1, { message: 'Please select a child' }),
    reportType: z.string().min(1, { message: 'Please select a report type' }),
    dateRange: z.string().min(1, { message: 'Please select a date range' }),
    startDate: z.date(),
    endDate: z.date().refine((date) => date >= new Date(new Date().setHours(0, 0, 0, 0)), {
      message: 'End date cannot be in the past',
    }),
  });

  const today = new Date();
  const currentWeekStart = startOfWeek(today);
  const currentWeekEnd = endOfWeek(today);
  const currentMonthStart = startOfMonth(today);
  const currentMonthEnd = endOfMonth(today);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      childId: 0,
      reportType: 'actions',
      dateRange: 'thisMonth',
      startDate: currentMonthStart,
      endDate: currentMonthEnd,
    },
  });

  const handleChangeDateRange = (value: string) => {
    setDateRange(value);
    
    if (value === 'custom') {
      setIsCustomRange(true);
    } else {
      setIsCustomRange(false);
      
      let startDate: Date;
      let endDate: Date;
      
      switch (value) {
        case 'thisWeek':
          startDate = currentWeekStart;
          endDate = currentWeekEnd;
          break;
        case 'lastMonth':
          const lastMonth = subMonths(today, 1);
          startDate = startOfMonth(lastMonth);
          endDate = endOfMonth(lastMonth);
          break;
        case 'thisMonth':
        default:
          startDate = currentMonthStart;
          endDate = currentMonthEnd;
          break;
      }
      
      form.setValue('startDate', startDate);
      form.setValue('endDate', endDate);
    }
  };

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    onSubmit(values);
  };

  // Filter family members to get only children
  const children = familyMembers?.filter((member: any) => member.role === UserRole.CHILD) || [];

  return (
    <Card>
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="grid gap-4 md:grid-cols-4">
            <FormField
              control={form.control}
              name="childId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('reports.selectChild')}</FormLabel>
                  <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value.toString() || "0"}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t('reports.selectChild')} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {children.map((child: any) => (
                        <SelectItem key={child.id} value={child.id.toString()}>
                          {child.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="reportType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('reports.reportType')}</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t('reports.reportType')} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="actions">{t('reports.actionsSummary')}</SelectItem>
                      <SelectItem value="points">{t('reports.pointsEarned')}</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="dateRange"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('reports.dateRange')}</FormLabel>
                  <Select 
                    onValueChange={(value) => {
                      field.onChange(value);
                      handleChangeDateRange(value);
                    }} 
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t('reports.dateRange')} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="thisWeek">{t('dashboard.thisWeek')}</SelectItem>
                      <SelectItem value="thisMonth">{t('dashboard.thisMonth')}</SelectItem>
                      <SelectItem value="lastMonth">Last Month</SelectItem>
                      <SelectItem value="custom">{t('reports.custom')}</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
            
            {isCustomRange && (
              <>
                <div className="md:col-span-2">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="startDate"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>{t('reports.from')}</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    "pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value ? (
                                    format(field.value, "PPP")
                                  ) : (
                                    <span>Pick a date</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) => isBefore(date, new Date(2000, 0, 1))}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="endDate"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>{t('reports.to')}</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    "pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value ? (
                                    format(field.value, "PPP")
                                  ) : (
                                    <span>Pick a date</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) => isBefore(date, form.getValues('startDate'))}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </>
            )}
            
            <div className={`flex items-end ${isCustomRange ? 'md:col-span-2' : ''}`}>
              <Button type="submit" className="w-full">
                {t('reports.generateReport')}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
