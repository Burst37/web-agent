# Templates

Server templates for running the Firecrawl Agent. Each wraps [agent-core](../agent-core/) with a different framework.

## Install

```bash
firecrawl create agent -t <template>
```

## Templates

| Template | Install | Best for |
|----------|---------|----------|
| [**Next.js**](./next/) | `firecrawl create agent -t next` | Full app with chat UI, streaming, skills |
| [**Express**](./express/) | `firecrawl create agent -t express` | API server, backend services |
| [**Library**](./library/) | `firecrawl create agent -t library` | Scripts, custom integrations |

All templates import from [agent-core](../agent-core/). The core logic is identical. Templates only differ in the HTTP/UI layer.
