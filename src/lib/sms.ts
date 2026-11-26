export interface InquiryNotificationPayload {
  trackingCode: string;
  customerName: string;
  phone: string;
  city: string;
  estimatedTotalIrr: number;
}

export async function sendInquiryNotifications(
  payload: InquiryNotificationPayload
): Promise<void> {
  const provider = (process.env.SMS_PROVIDER || "mock").toLowerCase();
  const apiKey = process.env.SMS_API_KEY?.trim();
  const sender = process.env.SMS_SENDER?.trim() || "";
  const factorySalesPhone = process.env.FACTORY_SALES_PHONE?.trim();

  const customerText = `گروه صنعتی سپنتا: درخواست شما با کد رهگیری ${payload.trackingCode} ثبت شد.`;

  try {
    if (provider === "mock" || !apiKey) {
      console.log(
        "[SMS:MOCK]",
        JSON.stringify({
          provider,
          trackingCode: payload.trackingCode,
          customerName: payload.customerName,
          phone: payload.phone,
          city: payload.city,
          estimatedTotalIrr: payload.estimatedTotalIrr,
          factorySalesPhone: factorySalesPhone || null,
          timestamp: new Date().toISOString(),
        })
      );
      return;
    }

    if (provider === "kavenegar") {
      const params = new URLSearchParams({
        receptor: payload.phone,
        message: customerText,
      });
      if (sender) params.set("sender", sender);

      await fetch(
        `https://api.kavenegar.com/v1/${encodeURIComponent(apiKey)}/sms/send.json`,
        {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: params.toString(),
          signal: AbortSignal.timeout(4000),
        }
      );

      if (factorySalesPhone) {
        const salesParams = new URLSearchParams({
          receptor: factorySalesPhone,
          message: `استعلام جدید ${payload.trackingCode} - ${payload.customerName} (${payload.city}) - ${payload.phone}`,
        });
        if (sender) salesParams.set("sender", sender);

        await fetch(
          `https://api.kavenegar.com/v1/${encodeURIComponent(apiKey)}/sms/send.json`,
          {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: salesParams.toString(),
            signal: AbortSignal.timeout(4000),
          }
        );
      }
      return;
    }

    if (provider === "smsir") {
      await fetch("https://api.sms.ir/v1/send/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-KEY": apiKey,
        },
        body: JSON.stringify({
          mobile: payload.phone,
          templateId: Number(process.env.SMSIR_TEMPLATE_ID || 100000),
          parameters: [{ name: "CODE", value: payload.trackingCode }],
        }),
        signal: AbortSignal.timeout(4000),
      });
    }
  } catch (error) {
    // Non-blocking: SMS gateway failures must never reject a persisted inquiry
    console.error("[SMS:ERROR]", error);
  }
}
