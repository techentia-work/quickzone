import React from "react";

function ReturnPolicy() {
  return (
    <div className="min-h-screen bg-white py-12 px-6 md:px-16">
      <div className="max-w-5xl mx-auto text-gray-800">
        <h1 className="text-4xl font-bold text-emerald-700 mb-6">
          Return Policy – Quickzon
        </h1>

        <p className="mb-6">
          At Quickzon, we are committed to providing our customers with fresh,
          high-quality groceries and ensuring complete satisfaction with every
          purchase. We understand that sometimes situations may arise where you
          need to return or exchange an item.
        </p>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-emerald-600 mb-2">
            Eligibility for Returns
          </h2>
          <p>
            Returns are accepted if the product delivered is damaged, expired,
            defective, or incorrect compared to your order. Customers are
            required to inform us of such issues within{" "}
            <strong>24 hours of delivery</strong> through our customer support
            channels, along with relevant order details and clear images as
            proof.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-emerald-600 mb-2">
            Return Conditions
          </h2>
          <p>
            Products must be returned in their original packaging and condition,
            and perishable items must be returned immediately to maintain quality
            standards. Once the return is approved, Quickzon will arrange for a
            replacement or initiate a refund as per our policy.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-emerald-600 mb-2">
            Refund Process
          </h2>
          <p>
            Refunds, when applicable, will be processed to the original payment
            method within a reasonable time frame. Please note that items that
            have been opened, used, or are not in their original condition will
            not be eligible for return.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-emerald-600 mb-2">
            Non-Returnable Items
          </h2>
          <p>
            Certain products, such as fresh dairy, meat, and bakery items, may be
            exempt from returns unless they are damaged or expired upon delivery.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-emerald-600 mb-2">
            Policy Updates
          </h2>
          <p>
            Quickzon reserves the right to update or modify this Return Policy at
            any time. Any changes will be reflected in the latest version
            available on our platform.
          </p>
        </section>
      </div>
    </div>
  );
}

export default ReturnPolicy;
