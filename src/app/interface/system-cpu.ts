export interface SystemCpu {
  status: string;
  description: string;
  baseUnit: any;
  measurements: [{ statistic: string, value: number }];
  availableTags: any[];
}
