export enum AlertType {
  WEATHER = 'WEATHER', // demand expected to drop due to weather
  ML = 'ML', // model training/confidence issues
  PROMOTION = 'PROMOTION', // expiring or suggested promotions
  SALES = 'SALES', // actual sales vs prediction anomalies, inactivity
  PRODUCT = 'PRODUCT', // stale/never-sold products
  SYSTEM = 'SYSTEM', // infra issues (e.g. ML service unreachable)
}