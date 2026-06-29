# Logging

> Source: `src/content/docs/general/logging.mdx`
> Canonical URL: https://rivet.dev/docs/general/logging
> Description: Actors provide a built-in way to log complex data to the console.

---
Using the context's log object (`c.log`) allows you to log complex data using structured logging.

Using the actor logging API is completely optional.

## Log levels

There are 7 log levels:

| Level  | Call                            | Description                                                      |
| ------ | ------------------------------- | ---------------------------------------------------------------- |
| Fatal  | `c.log.fatal(message, ...args);`   | Critical errors that prevent core functionality                 |
| Error  | `c.log.error(message, ...args);`    | Errors that affect functionality but allow continued operation  |
| Warn   | `c.log.warn(message, ...args);`     | Potentially harmful situations that should be addressed         |
| Info   | `c.log.info(message, ...args);`     | General information about significant events & state changes    |
| Debug  | `c.log.debug(message, ...args);`    | Detailed debugging information, usually used in development     |
| Trace  | `c.log.trace(message, ...args);`    | Very detailed debugging information, usually for tracing flow   |
| Silent | N/A                             | Disables all logging output                                     |

## Structured logging

The built-in logging API (using `c.log`) provides structured logging to let you log key-value
pairs instead of raw strings. Structured logs are readable by both machines &
humans to make them easier to parse & search.

When using `c.log`, the actor's name, key, and actor ID are automatically included in every log output. This makes it easy to filter and trace logs by specific actors in production environments.

### Examples

The logging system is built on [Pino](https://getpino.io/#/docs/api?id=logger), a high-performance structured logger for Node.js.

## Configuration

### Environment Variables

You can configure logging behavior using environment variables:

| Variable | Description | Values | Default |
| -------- | ----------- | ------ | ------- |
| `RIVET_LOG_LEVEL` | Sets the minimum log level to display | `trace`, `debug`, `info`, `warn`, `error`, `fatal`, `silent` | `warn` |
| `RIVET_LOG_TARGET` | Include the module name that logged the message | `1` to enable, `0` to disable | `0` |
| `RIVET_LOG_TIMESTAMP` | Include timestamp in log output | `1` to enable, `0` to disable | `0` |
| `RIVET_LOG_MESSAGE` | Enable detailed message logging for debugging | `1` to enable, `0` to disable | `0` |
| `RIVET_LOG_ERROR_STACK` | Include stack traces in error output | `1` to enable, `0` to disable | `0` |
| `RIVET_LOG_HEADERS` | Log HTTP headers in requests | `1` to enable, `0` to disable | `0` |

Example:
```bash
RIVET_LOG_LEVEL=debug RIVET_LOG_TARGET=1 RIVET_LOG_TIMESTAMP=1 node server.js
```

### Log Level

You can configure the log level programmatically when setting up your registry:

### Custom Pino Logger

You can also provide a custom Pino base logger for more advanced logging configurations:

If using a custom base logger, you must manually configure your own log level in the Pino logger.

For more advanced Pino configuration options, see the [Pino API documentation](https://getpino.io/#/docs/api?id=export).

### Disable Welcome Message

You can disable the default RivetKit welcome message with:

_Source doc path: /docs/general/logging_
