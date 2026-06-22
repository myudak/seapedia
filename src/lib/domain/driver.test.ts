import { beforeEach, describe, expect, it } from "vitest";
import {
  addCartItem,
  createCheckoutOrder,
  getState,
  processSellerOrder,
  takeDeliveryJob,
} from "./state";

describe("driver delivery jobs", () => {
  beforeEach(() => {
    globalThis.__seapediaState = undefined;
  });

  it("prevents two drivers from taking the same job", () => {
    const state = getState();
    const buyer = state.users.find((user) => user.username === "buyer")!;
    const firstDriver = state.users.find((user) => user.username === "driver")!;
    const secondDriver = state.users.find((user) => user.username === "maya")!;
    const product = state.products[0];

    addCartItem(buyer.id, product.id, 1);
    const order = createCheckoutOrder(buyer.id, "Regular");
    processSellerOrder(order.sellerId, order.id);

    const job = getState().deliveryJobs.find((item) => item.orderId === order.id)!;
    takeDeliveryJob(firstDriver.id, job.id);

    expect(() => takeDeliveryJob(secondDriver.id, job.id)).toThrow(
      "Delivery job already taken.",
    );
  });
});
