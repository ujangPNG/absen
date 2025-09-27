
import { NodeSDK } from "@opentelemetry/sdk-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { ConsoleSpanExporter } from "@opentelemetry/sdk-trace-base";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { Resource } from "@opentelemetry/resources";
import { SemanticResourceAttributes } from "@opentelemetry/semantic-conventions";

// Tentukan exporter berdasarkan environment
// Untuk production, gunakan OTLPExporter. Untuk development, gunakan ConsoleExporter.
const traceExporter =
  process.env.NODE_ENV === "production"
    ? new OTLPTraceExporter() // Endpoint bisa dikonfigurasi via env var OTEL_EXPORTER_OTLP_ENDPOINT
    : new ConsoleSpanExporter();

const sdk = new NodeSDK({
  // Tentukan nama service untuk diidentifikasi di backend observability
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: "absen-app",
  }),
  traceExporter,
  // Aktifkan auto-instrumentation untuk library populer (fetch, http, etc.)
  instrumentations: [getNodeAutoInstrumentations()],
});

sdk.start();

console.log("OpenTelemetry SDK started...");

// Graceful shutdown
process.on("SIGTERM", () => {
  sdk
    .shutdown()
    .then(() => console.log("OpenTelemetry SDK shut down successfully."))
    .catch((error) => console.log("Error shutting down OpenTelemetry SDK.", error))
    .finally(() => process.exit(0));
});
