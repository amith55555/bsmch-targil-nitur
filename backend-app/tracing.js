const opentelemetry = require('@opentelemetry/sdk-node');
const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');
const { OTLPTraceExporter } = require('@opentelemetry/exporter-trace-otlp-http');

const sdk = new opentelemetry.NodeSDK({
  traceExporter: new OTLPTraceExporter({
    // Point this to the new port we just mapped!
    url: 'http://host.docker.internal:4319/v1/traces', 
  }),
  instrumentations: [getNodeAutoInstrumentations()],
  serviceName: 'nodejs-backend-api',
});

sdk.start();
console.log('Tracing initialized');