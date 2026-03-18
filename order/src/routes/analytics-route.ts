import express, { Request, Response } from "express";
import {
  CheckAuthorizedMiddleware,
  CurrentUserMiddleware,
  ApiResponse,
  ValidateRequestMiddleware,
  OrderStatusEnum,
  PaymentMethodEnum
} from "@tabletennisshop/common";
import { AnalyticsService } from "../services/analytics.service";
import { CheckType } from "@tabletennisshop/common";
import { body, query, validationResult } from "express-validator";

const router = express.Router();

/**
 * Middleware to check authorization and role (owner/employee)
 * Applied to all analytics routes
 */
const analyticsAuth = [
  CheckAuthorizedMiddleware,
  CurrentUserMiddleware,
  CheckType(["owner", "employee"])
];

/**
 * GET /api/analytics/orders/stats
 * Get order statistics by status with count and percentages
 * Query params: dateFrom, dateTo, status, customerId
 */
router.get(
  "/api/analytics/orders/stats",
  analyticsAuth,
  query("dateFrom").optional().isISO8601().withMessage("Invalid dateFrom format"),
  query("dateTo").optional().isISO8601().withMessage("Invalid dateTo format"),
  query("status").optional().isIn(Object.values(OrderStatusEnum)).withMessage("Invalid status"),
  query("customerId").optional().isMongoId().withMessage("Invalid customerId format"),
  ValidateRequestMiddleware,
  async (req: Request, res: Response) => {
    try {
      const { dateFrom, dateTo, status, customerId } = req.query;
      const stats = await AnalyticsService.getOrderStats(
        dateFrom as string | undefined,
        dateTo as string | undefined,
        status as OrderStatusEnum | undefined,
        customerId as string | undefined
      );

      const response: ApiResponse<any> = {
        statusCode: 200,
        message: "Order statistics retrieved successfully",
        data: stats,
        success: true,
      };
      res.status(200).send(response);
    } catch (error) {
      throw error;
    }
  }
);

/**
 * GET /api/analytics/orders/revenue
 * Get revenue analytics with breakdown by payment method and date
 * Query params: dateFrom, dateTo, paymentMethod, minAmount, maxAmount
 */
router.get(
  "/api/analytics/orders/revenue",
  analyticsAuth,
  query("dateFrom").optional().isISO8601().withMessage("Invalid dateFrom format"),
  query("dateTo").optional().isISO8601().withMessage("Invalid dateTo format"),
  query("paymentMethod").optional().isIn(Object.values(PaymentMethodEnum)).withMessage("Invalid payment method"),
  query("minAmount").optional().isFloat({ min: 0 }).withMessage("minAmount must be a number >= 0"),
  query("maxAmount").optional().isFloat({ min: 0 }).withMessage("maxAmount must be a number >= 0"),
  ValidateRequestMiddleware,
  async (req: Request, res: Response) => {
    try {
      const { dateFrom, dateTo, paymentMethod, minAmount, maxAmount } = req.query;
      const revenue = await AnalyticsService.getRevenueAnalytics(
        dateFrom as string | undefined,
        dateTo as string | undefined,
        paymentMethod as PaymentMethodEnum | undefined,
        minAmount ? parseFloat(minAmount as string) : undefined,
        maxAmount ? parseFloat(maxAmount as string) : undefined
      );

      const response: ApiResponse<typeof revenue> = {
        statusCode: 200,
        message: "Revenue analytics retrieved successfully",
        data: revenue,
        success: true,
      };
      res.status(200).send(response);
    } catch (error) {
      throw error;
    }
  }
);

/**
 * GET /api/analytics/orders/timeline
 * Get time-series order data grouped by day/week/month
 * Query params: dateFrom, dateTo, interval (day|week|month)
 */
router.get(
  "/api/analytics/orders/timeline",
  analyticsAuth,
  query("dateFrom").optional().isISO8601().withMessage("Invalid dateFrom format"),
  query("dateTo").optional().isISO8601().withMessage("Invalid dateTo format"),
  query("interval").optional().isIn(["day", "week", "month"]).withMessage("Invalid interval. Must be day, week, or month"),
  ValidateRequestMiddleware,
  async (req: Request, res: Response) => {
    try {
      const { dateFrom, dateTo, interval } = req.query;
      const timeline = await AnalyticsService.getOrderTimeline(
        dateFrom as string | undefined,
        dateTo as string | undefined,
        (interval as "day" | "week" | "month") || "day"
      );

      const response: ApiResponse<typeof timeline> = {
        statusCode: 200,
        message: "Order timeline retrieved successfully",
        data: timeline,
        success: true
      };
      res.status(200).send(response);
    } catch (error) {
      throw error;
    }
  }
);

/**
 * GET /api/analytics/products/bestsellers
 * Get top selling products by revenue/quantity
 * Query params: dateFrom, dateTo, limit
 */
router.get(
  "/api/analytics/products/bestsellers",
  analyticsAuth,
  query("dateFrom").optional().isISO8601().withMessage("Invalid dateFrom format"),
  query("dateTo").optional().isISO8601().withMessage("Invalid dateTo format"),
  query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("Limit must be between 1 and 100"),
  ValidateRequestMiddleware,
  async (req: Request, res: Response) => {
    try {
      const { dateFrom, dateTo, limit } = req.query;
      const bestsellers = await AnalyticsService.getBestsellers(
        dateFrom as string | undefined,
        dateTo as string | undefined,
        limit ? parseInt(limit as string) : 10
      );

      const response: ApiResponse<typeof bestsellers> = {
        statusCode: 200,
        message: "Bestsellers retrieved successfully",
        data: bestsellers,
        success: true
      };
      res.status(200).send(response);
    } catch (error) {
      throw error;
    }
  }
);

/**
 * GET /api/analytics/payments/methods
 * Get payment method breakdown with count and revenue
 * Query params: dateFrom, dateTo, paymentMethod
 */
router.get(
  "/api/analytics/payments/methods",
  analyticsAuth,
  query("dateFrom").optional().isISO8601().withMessage("Invalid dateFrom format"),
  query("dateTo").optional().isISO8601().withMessage("Invalid dateTo format"),
  query("paymentMethod").optional().isIn(Object.values(PaymentMethodEnum)).withMessage("Invalid payment method"),
  ValidateRequestMiddleware,
  async (req: Request, res: Response) => {
    try {
      const { dateFrom, dateTo, paymentMethod } = req.query;
      const paymentMethods = await AnalyticsService.getPaymentMethodAnalytics(
        dateFrom as string | undefined,
        dateTo as string | undefined,
        paymentMethod as PaymentMethodEnum | undefined
      );

      const response: ApiResponse<typeof paymentMethods> = {
        statusCode: 200,
        message: "Payment method analytics retrieved successfully",
        data: paymentMethods,
        success: true
      };
      res.status(200).send(response);
    } catch (error) {
      throw error;
    }
  }
);

/**
 * GET /api/analytics/customers/metrics
 * Get customer metrics and segments
 * Query params: dateFrom, dateTo
 */
router.get(
  "/api/analytics/customers/metrics",
  analyticsAuth,
  query("dateFrom").optional().isISO8601().withMessage("Invalid dateFrom format"),
  query("dateTo").optional().isISO8601().withMessage("Invalid dateTo format"),
  ValidateRequestMiddleware,
  async (req: Request, res: Response) => {
    try {
      const { dateFrom, dateTo } = req.query;
      const customerMetrics = await AnalyticsService.getCustomerMetrics(
        dateFrom as string | undefined,
        dateTo as string | undefined
      );

      const response: ApiResponse<typeof customerMetrics> = {
        statusCode: 200,
        message: "Customer metrics retrieved successfully",
        data: customerMetrics,
        success: true
      };
      res.status(200).send(response);
    } catch (error) {
      throw error;
    }
  }
);

/**
 * GET /api/analytics/dashboard-summary
 * Get comprehensive dashboard summary with all analytics
 * Query params: dateFrom, dateTo (both optional, defaults to last 30 days)
 */
router.get(
  "/api/analytics/dashboard-summary",
  analyticsAuth,
  query("dateFrom").optional().isISO8601().withMessage("Invalid dateFrom format"),
  query("dateTo").optional().isISO8601().withMessage("Invalid dateTo format"),
  ValidateRequestMiddleware,
  async (req: Request, res: Response) => {
    try {
      const { dateFrom, dateTo } = req.query;
      const summary = await AnalyticsService.getDashboardSummary(
        dateFrom as string | undefined,
        dateTo as string | undefined
      );

      const response: ApiResponse<typeof summary> = {
        statusCode: 200,
        message: "Dashboard summary retrieved successfully",
        data: summary,
        success: true
      };
      res.status(200).send(response);
    } catch (error) {
      throw error;
    }
  }
);

export { router as analyticsRouter };
