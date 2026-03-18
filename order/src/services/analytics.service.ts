import { BadRequestError, OrderStatusEnum, PaymentMethodEnum } from "@tabletennisshop/common";
import { OrderModel } from "../models/order.model";
import mongoose from "mongoose";

export interface DateRangeFilter {
  dateFrom?: string;
  dateTo?: string;
}

export interface OrderStatsResponse {
  total: number;
  byStatus: {
    [status in OrderStatusEnum]: {
      count: number;
      percentage: number;
    };
  };
  dateRange: {
    from: string;
    to: string;
  };
}

export interface RevenueAnalytics {
  totalRevenue: number;
  orderCount: number;
  averageOrderValue: number;
  byPaymentMethod: {
    [key in PaymentMethodEnum]: {
      count: number;
      revenue: number;
    };
  };
  byDateRange: Array<{
    date: string;
    revenue: number;
    count: number;
  }>;
  dateRange: {
    from: string;
    to: string;
  };
}

export interface TimelineItem {
  period: string;
  orderCount: number;
  revenue: number;
  averageOrderValue: number;
}

export interface BestsellersResponse {
  products: Array<{
    productId: string;
    orderCount: number;
    totalQuantity: number;
    totalRevenue: number;
    averagePrice: number;
    lastOrderDate: string;
  }>;
  dateRange: {
    from: string;
    to: string;
  };
}

export interface PaymentMethodAnalytics {
  methods: {
    [key in PaymentMethodEnum]: {
      count: number;
      revenue: number;
      percentage: number;
    };
  };
  totalTransactions: number;
  totalRevenue: number;
  dateRange: {
    from: string;
    to: string;
  };
}

export interface CustomerMetrics {
  totalCustomers: number;
  newCustomers: number;
  repeatCustomers: number;
  averageOrdersPerCustomer: number;
  averageCustomerValue: number;
  dateRange: {
    from: string;
    to: string;
  };
}

export interface DashboardSummary {
  stats: OrderStatsResponse;
  revenue: RevenueAnalytics;
  bestsellers: BestsellersResponse;
  paymentMethods: PaymentMethodAnalytics;
  customerMetrics: CustomerMetrics;
  dateRange: {
    from: string;
    to: string;
  };
}

export class AnalyticsService {
  /**
   * Validate and parse date range from query parameters
   */
  private static parseDateRange(dateFrom?: string, dateTo?: string): { from: Date; to: Date } {
    let from: Date;
    let to: Date;

    try {
      // If no dates provided, default to last 30 days
      if (!dateFrom && !dateTo) {
        to = new Date();
        from = new Date(to.getTime() - 30 * 24 * 60 * 60 * 1000);
      } else {
        if (!dateFrom || !dateTo) {
          throw new BadRequestError("Both dateFrom and dateTo must be provided");
        }
        from = new Date(dateFrom);
        to = new Date(dateTo);

        if (isNaN(from.getTime()) || isNaN(to.getTime())) {
          throw new BadRequestError("Invalid date format. Use ISO 8601 format (YYYY-MM-DD or ISO string)");
        }
      }

      if (from > to) {
        throw new BadRequestError("dateFrom must be before or equal to dateTo");
      }

      return { from, to };
    } catch (error) {
      if (error instanceof BadRequestError) throw error;
      throw new BadRequestError("Invalid date range");
    }
  }

  /**
   * Get order statistics (counts by status with percentages)
   */
  static async getOrderStats(
    dateFrom?: string,
    dateTo?: string,
    status?: OrderStatusEnum,
    customerId?: string
  ): Promise<OrderStatsResponse> {
    const { from, to } = this.parseDateRange(dateFrom, dateTo);

    const match: any = {
      createdAt: { $gte: from, $lte: to }
    };

    if (status) {
      match.status = status;
    }

    if (customerId) {
      match.user_id = new mongoose.Types.ObjectId(customerId);
    }

    const result = await OrderModel.aggregate([
      { $match: match },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const totalOrders = result.reduce((sum, item) => sum + item.count, 0);

    const byStatus: any = {};
    Object.values(OrderStatusEnum).forEach(s => {
      const statusData = result.find(r => r._id === s);
      byStatus[s] = {
        count: statusData?.count || 0,
        percentage: totalOrders > 0 ? ((statusData?.count || 0) / totalOrders) * 100 : 0
      };
    });

    return {
      total: totalOrders,
      byStatus,
      dateRange: {
        from: from.toISOString(),
        to: to.toISOString()
      }
    };
  }

  /**
   * Get revenue analytics with breakdown by payment method and date
   */
  static async getRevenueAnalytics(
    dateFrom?: string,
    dateTo?: string,
    paymentMethod?: PaymentMethodEnum,
    minAmount?: number,
    maxAmount?: number
  ): Promise<RevenueAnalytics> {
    const { from, to } = this.parseDateRange(dateFrom, dateTo);

    const match: any = {
      createdAt: { $gte: from, $lte: to },
      status: { $in: [OrderStatusEnum.FINISHED] } // Only count completed orders
    };

    if (paymentMethod) {
      match.payment_method = paymentMethod;
    }

    if (minAmount !== undefined || maxAmount !== undefined) {
      match.total_price = {};
      if (minAmount !== undefined) {
        match.total_price.$gte = minAmount;
      }
      if (maxAmount !== undefined) {
        match.total_price.$lte = maxAmount;
      }
    }

    // Overall revenue stats
    const overallStats = await OrderModel.aggregate([
      { $match: match },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$total_price" },
          orderCount: { $sum: 1 },
          avgOrderValue: { $avg: "$total_price" }
        }
      }
    ]);

    // Revenue by payment method
    const paymentStats = await OrderModel.aggregate([
      { $match: match },
      {
        $group: {
          _id: "$payment_method",
          count: { $sum: 1 },
          revenue: { $sum: "$total_price" }
        }
      }
    ]);

    // Revenue by date (daily)
    const dateStats = await OrderModel.aggregate([
      { $match: match },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
          },
          revenue: { $sum: "$total_price" },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const stats = overallStats[0] || { totalRevenue: 0, orderCount: 0, avgOrderValue: 0 };

    const byPaymentMethod: any = {};
    Object.values(PaymentMethodEnum).forEach(method => {
      const methodData = paymentStats.find(p => p._id === method);
      byPaymentMethod[method] = {
        count: methodData?.count || 0,
        revenue: methodData?.revenue || 0
      };
    });

    return {
      totalRevenue: stats.totalRevenue,
      orderCount: stats.orderCount,
      averageOrderValue: stats.avgOrderValue || 0,
      byPaymentMethod,
      byDateRange: dateStats.map(item => ({
        date: item._id,
        revenue: item.revenue,
        count: item.count
      })),
      dateRange: {
        from: from.toISOString(),
        to: to.toISOString()
      }
    };
  }

  /**
   * Get timeline/time-series data grouped by interval
   */
  static async getOrderTimeline(
    dateFrom?: string,
    dateTo?: string,
    interval: "day" | "week" | "month" = "day"
  ): Promise<TimelineItem[]> {
    const { from, to } = this.parseDateRange(dateFrom, dateTo);

    const match = {
      createdAt: { $gte: from, $lte: to }
    };

    let dateFormat = "%Y-%m-%d"; // day
    if (interval === "week") {
      dateFormat = "%Y-W%V"; // ISO week
    } else if (interval === "month") {
      dateFormat = "%Y-%m"; // year-month
    }

    const result = await OrderModel.aggregate([
      { $match: match },
      {
        $group: {
          _id: {
            $dateToString: { format: dateFormat, date: "$createdAt" }
          },
          orderCount: { $sum: 1 },
          revenue: { $sum: "$total_price" },
          avgOrderValue: { $avg: "$total_price" }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    return result.map(item => ({
      period: item._id,
      orderCount: item.orderCount,
      revenue: item.revenue,
      averageOrderValue: item.avgOrderValue || 0
    }));
  }

  /**
   * Get bestselling products
   */
  static async getBestsellers(
    dateFrom?: string,
    dateTo?: string,
    limit: number = 10
  ): Promise<BestsellersResponse> {
    const { from, to } = this.parseDateRange(dateFrom, dateTo);

    if (limit > 100) {
      limit = 100; // Cap at 100 for performance
    }

    const match = {
      createdAt: { $gte: from, $lte: to }
    };

    const result = await OrderModel.aggregate([
      { $match: match },
      { $unwind: "$products" },
      {
        $group: {
          _id: "$products.product_id",
          orderCount: { $sum: 1 },
          totalQuantity: { $sum: "$products.quantity" },
          totalRevenue: { $sum: { $multiply: ["$products.price", "$products.quantity"] } },
          averagePrice: { $avg: "$products.price" },
          lastOrderDate: { $max: "$createdAt" }
        }
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: limit }
    ]);

    return {
      products: result.map(item => ({
        productId: item._id.toHexString(),
        orderCount: item.orderCount,
        totalQuantity: item.totalQuantity,
        totalRevenue: item.totalRevenue,
        averagePrice: item.averagePrice,
        lastOrderDate: item.lastOrderDate.toISOString()
      })),
      dateRange: {
        from: from.toISOString(),
        to: to.toISOString()
      }
    };
  }

  /**
   * Get payment method breakdown
   */
  static async getPaymentMethodAnalytics(
    dateFrom?: string,
    dateTo?: string,
    paymentMethod?: PaymentMethodEnum
  ): Promise<PaymentMethodAnalytics> {
    const { from, to } = this.parseDateRange(dateFrom, dateTo);

    const match: any = {
      createdAt: { $gte: from, $lte: to }
    };

    if (paymentMethod) {
      match.payment_method = paymentMethod;
    }

    const result = await OrderModel.aggregate([
      { $match: match },
      {
        $group: {
          _id: "$payment_method",
          count: { $sum: 1 },
          revenue: { $sum: "$total_price" }
        }
      }
    ]);

    const totalTransactions = result.reduce((sum, item) => sum + item.count, 0);
    const totalRevenue = result.reduce((sum, item) => sum + item.revenue, 0);

    const methods: any = {};
    Object.values(PaymentMethodEnum).forEach(method => {
      const methodData = result.find(r => r._id === method);
      methods[method] = {
        count: methodData?.count || 0,
        revenue: methodData?.revenue || 0,
        percentage: totalTransactions > 0 ? ((methodData?.count || 0) / totalTransactions) * 100 : 0
      };
    });

    return {
      methods,
      totalTransactions,
      totalRevenue,
      dateRange: {
        from: from.toISOString(),
        to: to.toISOString()
      }
    };
  }

  /**
   * Get customer metrics and segments
   */
  static async getCustomerMetrics(
    dateFrom?: string,
    dateTo?: string
  ): Promise<CustomerMetrics> {
    const { from, to } = this.parseDateRange(dateFrom, dateTo);

    const match = {
      createdAt: { $gte: from, $lte: to }
    };

    // Total unique customers in this period
    const uniqueCustomers = await OrderModel.aggregate([
      { $match: match },
      { $group: { _id: "$user_id" } },
      { $count: "total" }
    ]);

    // Customer order counts
    const customerOrderCounts = await OrderModel.aggregate([
      { $match: match },
      {
        $group: {
          _id: "$user_id",
          orderCount: { $sum: 1 },
          totalSpent: { $sum: "$total_price" }
        }
      }
    ]);

    const totalCustomers = uniqueCustomers[0]?.total || 0;
    const newCustomers = totalCustomers; // All customers in this period are "new" to this period
    const repeatCustomers = customerOrderCounts.filter(c => c.orderCount > 1).length;

    const avgOrdersPerCustomer = customerOrderCounts.length > 0
      ? customerOrderCounts.reduce((sum, c) => sum + c.orderCount, 0) / customerOrderCounts.length
      : 0;

    const avgCustomerValue = customerOrderCounts.length > 0
      ? customerOrderCounts.reduce((sum, c) => sum + c.totalSpent, 0) / customerOrderCounts.length
      : 0;

    return {
      totalCustomers,
      newCustomers,
      repeatCustomers,
      averageOrdersPerCustomer: Math.round(avgOrdersPerCustomer * 100) / 100,
      averageCustomerValue: Math.round(avgCustomerValue * 100) / 100,
      dateRange: {
        from: from.toISOString(),
        to: to.toISOString()
      }
    };
  }

  /**
   * Get comprehensive dashboard summary
   */
  static async getDashboardSummary(
    dateFrom?: string,
    dateTo?: string
  ): Promise<DashboardSummary> {
    const { from, to } = this.parseDateRange(dateFrom, dateTo);

    const [stats, revenue, bestsellers, paymentMethods, customerMetrics] = await Promise.all([
      this.getOrderStats(from.toISOString(), to.toISOString()),
      this.getRevenueAnalytics(from.toISOString(), to.toISOString()),
      this.getBestsellers(from.toISOString(), to.toISOString(), 5),
      this.getPaymentMethodAnalytics(from.toISOString(), to.toISOString()),
      this.getCustomerMetrics(from.toISOString(), to.toISOString())
    ]);

    return {
      stats,
      revenue,
      bestsellers,
      paymentMethods,
      customerMetrics,
      dateRange: {
        from: from.toISOString(),
        to: to.toISOString()
      }
    };
  }
}
