#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { homedir, platform, userInfo } from 'node:os';
import { fileURLToPath } from 'node:url';

const PLUGIN_ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const SERVER_NAME = 'imweb-cli';
const SERVER_VERSION = '0.2.0';
const PROTOCOL_VERSION = '2024-11-05';

let inputBuffer = Buffer.alloc(0);
let cliEnsureCache = null;

const tools = [
  {
    name: 'imweb_cli_check',
    description: 'Check whether the official imweb CLI is available on this computer.',
    inputSchema: {
      type: 'object',
      additionalProperties: false,
      properties: {},
    },
  },
  {
    name: 'imweb_cli_install',
    description: 'Install or update the official imweb CLI from the public release channel on the host. Use automatically when the plugin needs the CLI; a Claude Desktop tool permission prompt is the user approval point.',
    inputSchema: {
      type: 'object',
      additionalProperties: false,
      properties: {
        force: {
          type: 'boolean',
          description: 'Reinstall even when the same CLI version is already present.',
          default: false,
        },
      },
    },
  },
  {
    name: 'imweb_auth_doctor',
    description: 'Inspect local imweb CLI authentication and refresh-token health.',
    inputSchema: {
      type: 'object',
      additionalProperties: false,
      properties: {},
    },
  },
  {
    name: 'imweb_auth_status',
    description: 'Read the current host imweb CLI login status without opening a browser. In Claude Desktop, if a permission prompt appears, tell the user to click Allow for this task.',
    inputSchema: {
      type: 'object',
      additionalProperties: false,
      properties: {},
    },
  },
  {
    name: 'imweb_auth_login',
    description: 'Start the host imweb CLI browser login flow. Use this when auth is missing or expired; guide the user to allow the tool prompt and finish login in the opened browser.',
    inputSchema: {
      type: 'object',
      additionalProperties: false,
      properties: {},
    },
  },
  {
    name: 'imweb_context',
    description: 'Read the current imweb CLI profile, site, unit, auth, and capability context.',
    inputSchema: {
      type: 'object',
      additionalProperties: false,
      properties: {},
    },
  },
  {
    name: 'imweb_command_capabilities',
    description: 'Read supported imweb command capabilities, optionally narrowed by domain or exact command path.',
    inputSchema: {
      type: 'object',
      additionalProperties: false,
      properties: {
        domain: {
          type: 'string',
          description: 'Optional command domain such as order, product, member, payment, promotion, community, site, or script.',
        },
        path: {
          type: 'string',
          description: 'Optional exact command path such as order list.',
        },
      },
    },
  },
  {
    name: 'imweb_order_list',
    description: 'Read imweb order list data through the local official imweb CLI. Returns a compact analysis-friendly payload by default to avoid oversized Desktop tool output.',
    inputSchema: {
      type: 'object',
      additionalProperties: false,
      properties: {
        page: {
          type: 'integer',
          minimum: 1,
          description: 'Page number to read.',
          default: 1,
        },
        limit: {
          type: 'integer',
          minimum: 1,
          maximum: 100,
          description: 'Maximum orders to read.',
          default: 5,
        },
        all: {
          type: 'boolean',
          description: 'Read all pages when the CLI supports it.',
          default: false,
        },
        unitCode: {
          type: 'string',
          description: 'Optional imweb unit code override.',
        },
        shippingPlaceCode: {
          type: 'string',
          description: 'Optional shipping or return place code filter.',
        },
        orderSectionStatus: {
          type: 'string',
          description: 'Optional order section status filter, including EXCHANGE_COMPLETE.',
        },
        redactSensitive: {
          type: 'boolean',
          description: 'Redact customer contact, address, and bank fields before returning data.',
          default: true,
        },
        compact: {
          type: 'boolean',
          description: 'Return an analysis-friendly compact order list by default. Set false only when raw order-list fields are required.',
          default: true,
        },
      },
    },
  },
  {
    name: 'imweb_order_get',
    description: 'Read one imweb order by order number through the local official imweb CLI. Redacts customer fields by default.',
    inputSchema: {
      type: 'object',
      additionalProperties: false,
      required: ['orderNo'],
      properties: {
        orderNo: {
          type: 'string',
          description: 'Order number to inspect.',
        },
        redactSensitive: {
          type: 'boolean',
          description: 'Redact customer contact, address, bank, token, and member fields before returning data.',
          default: true,
        },
      },
    },
  },
  {
    name: 'imweb_order_parcel_companies',
    description: 'Read available parcel companies through the local official imweb CLI.',
    inputSchema: {
      type: 'object',
      additionalProperties: false,
      properties: {},
    },
  },
  {
    name: 'imweb_order_shipping_places',
    description: 'Read shipping and return places through the local official imweb CLI. Redacts address and contact fields by default.',
    inputSchema: {
      type: 'object',
      additionalProperties: false,
      properties: {
        unitCode: {
          type: 'string',
          description: 'Optional imweb unit code override.',
        },
        shippingPlaceCode: {
          type: 'string',
          description: 'Optional shipping or return place code filter.',
        },
        shippingPlaceName: {
          type: 'string',
          description: 'Optional shipping or return place name filter.',
        },
        redactSensitive: {
          type: 'boolean',
          description: 'Redact address and contact fields before returning data.',
          default: true,
        },
      },
    },
  },
  {
    name: 'imweb_site_info',
    description: 'Read the current imweb site information through the local official imweb CLI.',
    inputSchema: {
      type: 'object',
      additionalProperties: false,
      properties: {},
    },
  },
  {
    name: 'imweb_site_menu',
    description: 'Read the current unit menu and access metadata through the local official imweb CLI.',
    inputSchema: {
      type: 'object',
      additionalProperties: false,
      properties: {
        unitCode: {
          type: 'string',
          description: 'Optional imweb unit code override.',
        },
      },
    },
  },
  {
    name: 'imweb_product_list',
    description: 'Read imweb product list data through the local official imweb CLI.',
    inputSchema: {
      type: 'object',
      additionalProperties: false,
      properties: {
        page: {
          type: 'integer',
          minimum: 1,
          description: 'Page number to read.',
          default: 1,
        },
        limit: {
          type: 'integer',
          minimum: 1,
          maximum: 100,
          description: 'Maximum products to read.',
          default: 5,
        },
        unitCode: {
          type: 'string',
          description: 'Optional imweb unit code override.',
        },
      },
    },
  },
  {
    name: 'imweb_product_get',
    description: 'Read one imweb product by product number through the local official imweb CLI.',
    inputSchema: {
      type: 'object',
      additionalProperties: false,
      required: ['prodNo'],
      properties: {
        prodNo: {
          type: 'string',
          description: 'Product number to inspect.',
        },
        unitCode: {
          type: 'string',
          description: 'Optional imweb unit code override.',
        },
      },
    },
  },
  {
    name: 'imweb_product_categories',
    description: 'Read imweb product categories through the local official imweb CLI.',
    inputSchema: {
      type: 'object',
      additionalProperties: false,
      properties: {
        unitCode: {
          type: 'string',
          description: 'Optional imweb unit code override.',
        },
      },
    },
  },
  {
    name: 'imweb_product_options_batch',
    description: 'Read options for up to 10 products through the local official imweb CLI.',
    inputSchema: {
      type: 'object',
      additionalProperties: false,
      required: ['prodNos'],
      properties: {
        prodNos: {
          type: 'array',
          minItems: 1,
          maxItems: 10,
          items: {
            oneOf: [
              { type: 'integer' },
              { type: 'string' },
            ],
          },
          description: 'Product numbers to inspect.',
        },
        unitCode: {
          type: 'string',
          description: 'Optional imweb unit code override.',
        },
      },
    },
  },
  {
    name: 'imweb_member_list',
    description: 'Read imweb member list data through the local official imweb CLI. Redacts member fields by default.',
    inputSchema: {
      type: 'object',
      additionalProperties: false,
      properties: {
        limit: {
          type: 'integer',
          minimum: 1,
          maximum: 1000,
          description: 'Maximum members to read per cursor page.',
          default: 5,
        },
        cursor: {
          type: 'string',
          description: 'Optional cursor to start from for cursor-based member pagination.',
        },
        direction: {
          type: 'string',
          enum: ['next', 'previous'],
          description: 'Cursor direction to follow.',
          default: 'next',
        },
        unitCode: {
          type: 'string',
          description: 'Optional imweb unit code override.',
        },
        recommendCode: {
          type: 'string',
          description: 'Optional referrer code filter.',
        },
        editTimeRangeType: {
          type: 'string',
          enum: ['GTE', 'LTE', 'BETWEEN'],
          description: 'Member edit time comparison.',
        },
        editTimeRangeValue: {
          type: 'array',
          minItems: 1,
          maxItems: 2,
          items: {
            type: 'string',
          },
          description: 'One timestamp for GTE/LTE or two timestamps for BETWEEN.',
        },
        redactSensitive: {
          type: 'boolean',
          description: 'Redact member/customer contact fields before returning data.',
          default: true,
        },
      },
    },
  },
  {
    name: 'imweb_promotion_coupon_list',
    description: 'Read imweb coupon list data through the local official imweb CLI.',
    inputSchema: {
      type: 'object',
      additionalProperties: false,
      properties: {
        page: {
          type: 'integer',
          minimum: 1,
          description: 'Page number to read.',
          default: 1,
        },
        limit: {
          type: 'integer',
          minimum: 1,
          maximum: 100,
          description: 'Maximum coupons to read.',
          default: 10,
        },
        unitCode: {
          type: 'string',
          description: 'Optional imweb unit code override.',
        },
        editDateType: {
          type: 'string',
          enum: ['GTE', 'LTE', 'BETWEEN'],
          description: 'Coupon edit date comparison.',
        },
        editDateValue: {
          type: 'array',
          minItems: 1,
          maxItems: 2,
          items: {
            type: 'string',
          },
          description: 'One timestamp for GTE/LTE or two timestamps for BETWEEN.',
        },
      },
    },
  },
  {
    name: 'imweb_promotion_coupon_targets_by_coupon',
    description: 'Read targeted-issue members for one coupon through the local official imweb CLI. Redacts member identifiers by default.',
    inputSchema: {
      type: 'object',
      additionalProperties: false,
      required: ['shopCouponCode'],
      properties: {
        shopCouponCode: {
          type: 'string',
          description: 'Coupon code to inspect.',
        },
        memberUid: {
          type: 'string',
          description: 'Optional member identifier filter.',
        },
        page: {
          type: 'integer',
          minimum: 1,
          default: 1,
        },
        limit: {
          type: 'integer',
          minimum: 1,
          maximum: 100,
          default: 10,
        },
        all: {
          type: 'boolean',
          default: false,
        },
        unitCode: {
          type: 'string',
          description: 'Optional imweb unit code override.',
        },
        redactSensitive: {
          type: 'boolean',
          description: 'Redact member identifiers before returning data.',
          default: true,
        },
      },
    },
  },
  {
    name: 'imweb_promotion_coupon_targets_by_member',
    description: 'Read targeted-issue coupons for one member through the local official imweb CLI. Redacts member identifiers by default.',
    inputSchema: {
      type: 'object',
      additionalProperties: false,
      required: ['memberUid'],
      properties: {
        memberUid: {
          type: 'string',
          description: 'Member identifier to inspect.',
        },
        page: {
          type: 'integer',
          minimum: 1,
          default: 1,
        },
        limit: {
          type: 'integer',
          minimum: 1,
          maximum: 100,
          default: 10,
        },
        all: {
          type: 'boolean',
          default: false,
        },
        unitCode: {
          type: 'string',
          description: 'Optional imweb unit code override.',
        },
        redactSensitive: {
          type: 'boolean',
          description: 'Redact member identifiers before returning data.',
          default: true,
        },
      },
    },
  },
  {
    name: 'imweb_promotion_point_log',
    description: 'Read imweb point history through the local official imweb CLI. Redacts member, admin, and order identifiers by default.',
    inputSchema: {
      type: 'object',
      additionalProperties: false,
      properties: {
        page: {
          type: 'integer',
          minimum: 1,
          default: 1,
        },
        limit: {
          type: 'integer',
          minimum: 1,
          maximum: 100,
          default: 10,
        },
        all: {
          type: 'boolean',
          default: false,
        },
        unitCode: {
          type: 'string',
          description: 'Optional imweb unit code override.',
        },
        memberUids: {
          type: 'array',
          items: {
            type: 'string',
          },
          description: 'Optional member identifiers.',
        },
        timeType: {
          type: 'string',
          enum: ['GTE', 'LTE', 'BETWEEN'],
          description: 'Point log time comparison.',
        },
        timeValue: {
          type: 'array',
          minItems: 1,
          maxItems: 2,
          items: {
            type: 'string',
          },
          description: 'One timestamp for GTE/LTE or two timestamps for BETWEEN.',
        },
        redactSensitive: {
          type: 'boolean',
          description: 'Redact member, admin, and order identifiers before returning data.',
          default: true,
        },
      },
    },
  },
  {
    name: 'imweb_community_forms_list',
    description: 'Read imweb input-form definitions through the local official imweb CLI.',
    inputSchema: {
      type: 'object',
      additionalProperties: false,
      properties: {
        page: {
          type: 'integer',
          minimum: 1,
          default: 1,
        },
        limit: {
          type: 'integer',
          minimum: 1,
          maximum: 100,
          default: 10,
        },
        all: {
          type: 'boolean',
          default: false,
        },
        unitCode: {
          type: 'string',
          description: 'Optional imweb unit code override.',
        },
        formCreateTimeType: {
          type: 'string',
          enum: ['GTE', 'LTE', 'BETWEEN'],
        },
        formCreateTime: {
          type: 'array',
          minItems: 1,
          maxItems: 2,
          items: {
            type: 'string',
          },
        },
        formEditTimeType: {
          type: 'string',
          enum: ['GTE', 'LTE', 'BETWEEN'],
        },
        formEditTime: {
          type: 'array',
          minItems: 1,
          maxItems: 2,
          items: {
            type: 'string',
          },
        },
      },
    },
  },
  {
    name: 'imweb_community_form_get',
    description: 'Read one imweb input-form definition through the local official imweb CLI.',
    inputSchema: {
      type: 'object',
      additionalProperties: false,
      required: ['formNo'],
      properties: {
        formNo: {
          oneOf: [
            { type: 'integer' },
            { type: 'string' },
          ],
          description: 'Input-form board number.',
        },
        unitCode: {
          type: 'string',
          description: 'Optional imweb unit code override.',
        },
      },
    },
  },
  {
    name: 'imweb_community_form_submissions_list',
    description: 'Read imweb input-form submissions through the local official imweb CLI. Returns compact metadata with submitted values removed by default.',
    inputSchema: {
      type: 'object',
      additionalProperties: false,
      properties: {
        page: {
          type: 'integer',
          minimum: 1,
          default: 1,
        },
        limit: {
          type: 'integer',
          minimum: 1,
          maximum: 100,
          default: 10,
        },
        all: {
          type: 'boolean',
          default: false,
        },
        unitCode: {
          type: 'string',
          description: 'Optional imweb unit code override.',
        },
        formNo: {
          oneOf: [
            { type: 'integer' },
            { type: 'string' },
          ],
          description: 'Optional input-form board number filter.',
        },
        formSubmitTimeType: {
          type: 'string',
          enum: ['GTE', 'LTE', 'BETWEEN'],
        },
        formSubmitTime: {
          type: 'array',
          minItems: 1,
          maxItems: 2,
          items: {
            type: 'string',
          },
        },
        redactSensitive: {
          type: 'boolean',
          description: 'Redact submitted values and member fields before returning data.',
          default: true,
        },
        compact: {
          type: 'boolean',
          description: 'Return submission metadata without arbitrary submitted values.',
          default: true,
        },
      },
    },
  },
  {
    name: 'imweb_community_form_submission_get',
    description: 'Read one imweb input-form submission through the local official imweb CLI. Returns compact metadata with submitted values removed by default.',
    inputSchema: {
      type: 'object',
      additionalProperties: false,
      required: ['submitCode'],
      properties: {
        submitCode: {
          type: 'string',
          description: 'Submission code to inspect.',
        },
        unitCode: {
          type: 'string',
          description: 'Optional imweb unit code override.',
        },
        redactSensitive: {
          type: 'boolean',
          description: 'Redact submitted values and member fields before returning data.',
          default: true,
        },
        compact: {
          type: 'boolean',
          description: 'Return submission metadata without arbitrary submitted values.',
          default: true,
        },
      },
    },
  },
  {
    name: 'imweb_community_review_list',
    description: 'Read imweb product review list data through the local official imweb CLI. Redacts reviewer fields by default.',
    inputSchema: {
      type: 'object',
      additionalProperties: false,
      properties: {
        page: {
          type: 'integer',
          minimum: 1,
          description: 'Page number to read.',
          default: 1,
        },
        limit: {
          type: 'integer',
          minimum: 1,
          maximum: 100,
          description: 'Maximum reviews to read.',
          default: 10,
        },
        redactSensitive: {
          type: 'boolean',
          description: 'Redact reviewer/member/contact fields before returning data.',
          default: true,
        },
      },
    },
  },
];

process.stdin.on('data', (chunk) => {
  inputBuffer = Buffer.concat([inputBuffer, chunk]);
  readMessages();
});

process.stdin.on('end', () => {
  process.exit(0);
});

function readMessages() {
  while (inputBuffer.length > 0) {
    if (startsWithContentLength(inputBuffer)) {
      const headerEnd = inputBuffer.indexOf('\r\n\r\n');
      if (headerEnd === -1) return;

      const header = inputBuffer.slice(0, headerEnd).toString('utf8');
      const match = header.match(/content-length:\s*(\d+)/i);
      if (!match) {
        inputBuffer = inputBuffer.slice(headerEnd + 4);
        continue;
      }

      const length = Number(match[1]);
      const bodyStart = headerEnd + 4;
      const bodyEnd = bodyStart + length;
      if (inputBuffer.length < bodyEnd) return;

      const body = inputBuffer.slice(bodyStart, bodyEnd).toString('utf8');
      inputBuffer = inputBuffer.slice(bodyEnd);
      handleRawMessage(body);
      continue;
    }

    const lineEnd = inputBuffer.indexOf('\n');
    if (lineEnd === -1) return;

    const line = inputBuffer.slice(0, lineEnd).toString('utf8').trim();
    inputBuffer = inputBuffer.slice(lineEnd + 1);
    if (!line) continue;
    handleRawMessage(line);
  }
}

function startsWithContentLength(buffer) {
  return /^content-length:/i.test(buffer.slice(0, 32).toString('utf8'));
}

function handleRawMessage(raw) {
  let message;
  try {
    message = JSON.parse(raw);
  } catch (error) {
    sendError(null, -32700, `Parse error: ${error.message}`);
    return;
  }

  handleMessage(message);
}

function handleMessage(message) {
  const { id, method, params } = message;
  const isNotification = id === undefined || id === null;
  if (isNotification && String(method || '').startsWith('notifications/')) {
    return;
  }

  try {
    switch (method) {
      case 'initialize':
        sendResult(id, {
          protocolVersion: params?.protocolVersion || PROTOCOL_VERSION,
          capabilities: {
            tools: {},
          },
          serverInfo: {
            name: SERVER_NAME,
            version: SERVER_VERSION,
          },
        });
        break;
      case 'tools/list':
        sendResult(id, { tools });
        break;
      case 'tools/call':
        callTool(id, params || {});
        break;
      default:
        sendError(id, -32601, `Method not found: ${method}`);
    }
  } catch (error) {
    sendError(id, -32603, error.message || String(error));
  }
}

function callTool(id, params) {
  const name = params.name;
  const args = params.arguments || {};
  const handler = {
    imweb_cli_check: cliCheck,
    imweb_cli_install: cliInstall,
    imweb_auth_doctor: authDoctor,
    imweb_auth_status: authStatus,
    imweb_auth_login: authLogin,
    imweb_context: context,
    imweb_command_capabilities: commandCapabilities,
    imweb_order_list: orderList,
    imweb_order_get: orderGet,
    imweb_order_parcel_companies: orderParcelCompanies,
    imweb_order_shipping_places: orderShippingPlaces,
    imweb_site_info: siteInfo,
    imweb_site_menu: siteMenu,
    imweb_product_list: productList,
    imweb_product_get: productGet,
    imweb_product_categories: productCategories,
    imweb_product_options_batch: productOptionsBatch,
    imweb_member_list: memberList,
    imweb_promotion_coupon_list: promotionCouponList,
    imweb_promotion_coupon_targets_by_coupon: promotionCouponTargetsByCoupon,
    imweb_promotion_coupon_targets_by_member: promotionCouponTargetsByMember,
    imweb_promotion_point_log: promotionPointLog,
    imweb_community_forms_list: communityFormsList,
    imweb_community_form_get: communityFormGet,
    imweb_community_form_submissions_list: communityFormSubmissionsList,
    imweb_community_form_submission_get: communityFormSubmissionGet,
    imweb_community_review_list: communityReviewList,
  }[name];

  if (!handler) {
    sendError(id, -32602, `Unknown tool: ${name}`);
    return;
  }

  const result = handler(args);
  sendResult(id, toToolResult(result));
}

function toToolResult(result) {
  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(result, null, 2),
      },
    ],
    isError: Boolean(result && result.ok === false),
  };
}

function sendResult(id, result) {
  send({ jsonrpc: '2.0', id, result });
}

function sendError(id, code, message) {
  send({
    jsonrpc: '2.0',
    id,
    error: {
      code,
      message,
    },
  });
}

function send(payload) {
  process.stdout.write(`${JSON.stringify(payload)}\n`);
}

function cliCheck() {
  const bin = findImwebBinary();
  if (!bin) {
    return {
      ok: false,
      available: false,
      message: 'imweb CLI was not found on this computer.',
      searched: candidateBinaries(),
      autoUpdateManaged: true,
    };
  }

  const version = run(bin, ['--version'], { allowFailure: true });
  return {
    ok: version.status === 0,
    available: version.status === 0,
    path: bin,
    version: version.stdout.trim() || version.stderr.trim() || null,
    status: version.status,
    autoUpdateManaged: true,
  };
}

function cliInstall(args) {
  cliEnsureCache = null;
  const script = platform() === 'win32'
    ? join(PLUGIN_ROOT, 'install', 'install-cli.ps1')
    : join(PLUGIN_ROOT, 'install', 'install-cli.sh');

  if (!existsSync(script)) {
    return {
      ok: false,
      message: `installer is missing from plugin package: ${script}`,
    };
  }

  const command = platform() === 'win32' ? preferredPowerShell() : 'bash';
  const commandArgs = platform() === 'win32'
    ? ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', script]
    : [script];
  if (args.force) {
    if (platform() === 'win32') {
      commandArgs.push('-Force');
    } else {
      commandArgs.push('--force');
    }
  }

  const result = run(command, commandArgs, { allowFailure: true, timeout: 120000 });
  return {
    ok: result.status === 0,
    status: result.status,
    stdout: result.stdout.trim(),
    stderr: result.stderr.trim(),
  };
}

function authDoctor() {
  return runJson(['--output', 'json', 'auth', 'doctor']);
}

function authStatus() {
  return runJson(['--output', 'json', 'auth', 'status']);
}

function authLogin() {
  const ensured = ensureCliReady();
  const bin = ensured.bin;
  if (!bin) {
    return {
      ok: false,
      available: false,
      message: 'imweb CLI was not found on this computer, and automatic plugin-managed CLI install/update did not make it available.',
      searched: candidateBinaries(),
      cliEnsure: ensured.summary,
      nextSteps: [
        'If Claude Desktop shows a tool permission prompt, ask the user to click Allow for this task.',
        'Then call imweb_auth_login again.',
      ],
    };
  }

  const result = run(bin, ['--output', 'json', 'auth', 'login'], {
    allowFailure: true,
    timeout: 300000,
  });

  return {
    ok: result.status === 0,
    path: bin,
    status: result.status,
    stdout: redactLoginOutput(result.stdout.trim()),
    stderr: redactLoginOutput(result.stderr.trim()),
    cliEnsure: ensured.summary,
    nextSteps: result.status === 0
      ? [
          'If Claude Desktop asks for another imweb tool permission, ask the user to click Allow for this task.',
          'Call imweb_auth_status or imweb_context to confirm authentication.',
          'Retry the original imweb task.',
        ]
      : [
          'If Claude Desktop shows a tool permission prompt, ask the user to click Allow for this task.',
          'If a browser window is open, ask the user to finish the imweb login there.',
          'Then call imweb_auth_status or imweb_context.',
        ],
  };
}

function context() {
  return runJson(['--output', 'json', 'config', 'context']);
}

function commandCapabilities(args) {
  const cliArgs = ['--output', 'json', 'config', 'command-capabilities'];
  if (args.domain) cliArgs.push('--domain', String(args.domain));
  if (args.path) cliArgs.push('--path', String(args.path));
  return runJson(cliArgs);
}

function orderList(args) {
  const cliArgs = ['--output', 'json', 'order', 'list'];
  appendPageArgs(cliArgs, args, 5);
  if (args.unitCode) cliArgs.push('--unit-code', String(args.unitCode));
  if (args.shippingPlaceCode) cliArgs.push('--shipping-place-code', String(args.shippingPlaceCode));
  if (args.orderSectionStatus) cliArgs.push('--order-section-status', String(args.orderSectionStatus));

  const result = runJson(cliArgs);
  if (result.ok && args.redactSensitive !== false) {
    result.data = redact(result.data);
    result.redacted = true;
  }
  if (result.ok && args.compact !== false) {
    result.data = compactOrderListData(result.data);
    result.compact = true;
    result.compactGuidance = 'Use imweb_order_get for exact order detail. Call imweb_order_list with compact=false only when raw list fields are required.';
  }
  return result;
}

function orderGet(args) {
  if (!args.orderNo) {
    return { ok: false, message: 'orderNo is required.' };
  }
  const result = runJson(['--output', 'json', 'order', 'get', String(args.orderNo)]);
  if (result.ok && args.redactSensitive !== false) {
    result.data = redact(result.data);
    result.redacted = true;
  }
  return result;
}

function orderParcelCompanies() {
  return runJson(['--output', 'json', 'order', 'parcel-companies']);
}

function orderShippingPlaces(args) {
  const cliArgs = ['--output', 'json', 'order', 'shipping-places'];
  if (args.unitCode) cliArgs.push('--unit-code', String(args.unitCode));
  if (args.shippingPlaceCode) cliArgs.push('--shipping-place-code', String(args.shippingPlaceCode));
  if (args.shippingPlaceName) cliArgs.push('--shipping-place-name', String(args.shippingPlaceName));
  const result = runJson(cliArgs);
  if (result.ok && args.redactSensitive !== false) {
    result.data = redactMatchingKeys(result.data, /address|addr|call|phone|mobile|cell|tel|contact|zip|postal|postcode/i);
    result.redacted = true;
  }
  return result;
}

function siteInfo() {
  return runJson(['--output', 'json', 'site', 'info']);
}

function siteMenu(args) {
  const cliArgs = ['--output', 'json', 'site', 'menu'];
  if (args.unitCode) cliArgs.push('--unit-code', String(args.unitCode));
  return runJson(cliArgs);
}

function productList(args) {
  const cliArgs = ['--output', 'json', 'product', 'list'];
  cliArgs.push('--page', String(clampInteger(args.page, 1, 1, 100000)), '--limit', String(clampInteger(args.limit, 5, 1, 100)));
  if (args.unitCode) cliArgs.push('--unit-code', String(args.unitCode));
  return runJson(cliArgs);
}

function productGet(args) {
  if (!args.prodNo) {
    return { ok: false, message: 'prodNo is required.' };
  }
  const cliArgs = ['--output', 'json', 'product', 'get'];
  if (args.unitCode) cliArgs.push('--unit-code', String(args.unitCode));
  cliArgs.push(String(args.prodNo));
  return runJson(cliArgs);
}

function productCategories(args) {
  const cliArgs = ['--output', 'json', 'product', 'categories'];
  if (args.unitCode) cliArgs.push('--unit-code', String(args.unitCode));
  return runJson(cliArgs);
}

function productOptionsBatch(args) {
  const prodNos = Array.isArray(args.prodNos)
    ? args.prodNos.map((value) => String(value).trim()).filter(Boolean)
    : [];
  if (prodNos.length === 0 || prodNos.length > 10) {
    return { ok: false, message: 'prodNos must contain between 1 and 10 product numbers.' };
  }
  const cliArgs = ['--output', 'json', 'product', 'options', 'batch'];
  for (const prodNo of prodNos) cliArgs.push('--prod-no', prodNo);
  if (args.unitCode) cliArgs.push('--unit-code', String(args.unitCode));
  return runJson(cliArgs);
}

function memberList(args) {
  const cliArgs = ['--output', 'json', 'member', 'list'];
  cliArgs.push('--limit', String(clampInteger(args.limit, 5, 1, 1000)));
  if (args.cursor) cliArgs.push('--cursor', String(args.cursor));
  const direction = args.direction === 'previous' ? 'previous' : args.direction === 'next' ? 'next' : null;
  if (direction) cliArgs.push('--direction', direction);
  if (args.unitCode) cliArgs.push('--unit-code', String(args.unitCode));
  if (args.recommendCode) cliArgs.push('--recommend-code', String(args.recommendCode));
  const rangeError = appendRangeArgs(
    cliArgs,
    args.editTimeRangeType,
    args.editTimeRangeValue,
    '--edit-time-range-type',
    '--edit-time-range-value',
  );
  if (rangeError) return { ok: false, message: rangeError };
  const result = runJson(cliArgs);
  if (result.ok && args.redactSensitive !== false) {
    result.data = redact(result.data);
    result.redacted = true;
  }
  return result;
}

function promotionCouponList(args) {
  const cliArgs = ['--output', 'json', 'promotion', 'coupon', 'list'];
  cliArgs.push('--page', String(clampInteger(args.page, 1, 1, 100000)), '--limit', String(clampInteger(args.limit, 10, 1, 100)));
  if (args.unitCode) cliArgs.push('--unit-code', String(args.unitCode));
  const rangeError = appendRangeArgs(
    cliArgs,
    args.editDateType,
    args.editDateValue,
    '--edit-date-type',
    '--edit-date-value',
  );
  if (rangeError) return { ok: false, message: rangeError };
  return runJson(cliArgs);
}

function promotionCouponTargetsByCoupon(args) {
  if (!args.shopCouponCode) {
    return { ok: false, message: 'shopCouponCode is required.' };
  }
  const cliArgs = [
    '--output',
    'json',
    'promotion',
    'coupon',
    'targets',
    'by-coupon',
    String(args.shopCouponCode),
  ];
  appendPageArgs(cliArgs, args, 10);
  if (args.memberUid) cliArgs.push('--member-uid', String(args.memberUid));
  if (args.unitCode) cliArgs.push('--unit-code', String(args.unitCode));
  return runWithIdentifierRedaction(cliArgs, args);
}

function promotionCouponTargetsByMember(args) {
  if (!args.memberUid) {
    return { ok: false, message: 'memberUid is required.' };
  }
  const cliArgs = [
    '--output',
    'json',
    'promotion',
    'coupon',
    'targets',
    'by-member',
    String(args.memberUid),
  ];
  appendPageArgs(cliArgs, args, 10);
  if (args.unitCode) cliArgs.push('--unit-code', String(args.unitCode));
  return runWithIdentifierRedaction(cliArgs, args);
}

function promotionPointLog(args) {
  const cliArgs = ['--output', 'json', 'promotion', 'point', 'log'];
  appendPageArgs(cliArgs, args, 10);
  if (args.unitCode) cliArgs.push('--unit-code', String(args.unitCode));
  if (Array.isArray(args.memberUids)) {
    for (const memberUid of args.memberUids) {
      if (String(memberUid).trim()) cliArgs.push('--member-uid', String(memberUid));
    }
  }
  const rangeError = appendRangeArgs(
    cliArgs,
    args.timeType,
    args.timeValue,
    '--time-type',
    '--time-value',
  );
  if (rangeError) return { ok: false, message: rangeError };
  const result = runJson(cliArgs);
  if (result.ok && args.redactSensitive !== false) {
    result.data = redactMatchingKeys(
      result.data,
      /^(memberUid|adminUid|orderNo|orderCode|paymentNo|shopCouponIssueCode)$/i,
    );
    result.redacted = true;
  }
  return result;
}

function communityFormsList(args) {
  const cliArgs = ['--output', 'json', 'community', 'forms', 'list'];
  appendPageArgs(cliArgs, args, 10);
  if (args.unitCode) cliArgs.push('--unit-code', String(args.unitCode));
  const createRangeError = appendRangeArgs(
    cliArgs,
    args.formCreateTimeType,
    args.formCreateTime,
    '--form-create-time-type',
    '--form-create-time',
  );
  if (createRangeError) return { ok: false, message: createRangeError };
  const editRangeError = appendRangeArgs(
    cliArgs,
    args.formEditTimeType,
    args.formEditTime,
    '--form-edit-time-type',
    '--form-edit-time',
  );
  if (editRangeError) return { ok: false, message: editRangeError };
  return runJson(cliArgs);
}

function communityFormGet(args) {
  if (args.formNo === undefined || args.formNo === null || String(args.formNo).trim() === '') {
    return { ok: false, message: 'formNo is required.' };
  }
  const cliArgs = ['--output', 'json', 'community', 'forms', 'get', String(args.formNo)];
  if (args.unitCode) cliArgs.push('--unit-code', String(args.unitCode));
  return runJson(cliArgs);
}

function communityFormSubmissionsList(args) {
  const cliArgs = ['--output', 'json', 'community', 'form-submissions', 'list'];
  appendPageArgs(cliArgs, args, 10);
  if (args.unitCode) cliArgs.push('--unit-code', String(args.unitCode));
  if (args.formNo !== undefined && args.formNo !== null && String(args.formNo).trim()) {
    cliArgs.push('--form-no', String(args.formNo));
  }
  const rangeError = appendRangeArgs(
    cliArgs,
    args.formSubmitTimeType,
    args.formSubmitTime,
    '--form-submit-time-type',
    '--form-submit-time',
  );
  if (rangeError) return { ok: false, message: rangeError };
  return runFormSubmission(cliArgs, args);
}

function communityFormSubmissionGet(args) {
  if (!args.submitCode) {
    return { ok: false, message: 'submitCode is required.' };
  }
  const cliArgs = [
    '--output',
    'json',
    'community',
    'form-submissions',
    'get',
    String(args.submitCode),
  ];
  if (args.unitCode) cliArgs.push('--unit-code', String(args.unitCode));
  return runFormSubmission(cliArgs, args);
}

function communityReviewList(args) {
  const cliArgs = ['--output', 'json', 'community', 'review', 'list'];
  cliArgs.push('--page', String(clampInteger(args.page, 1, 1, 100000)), '--limit', String(clampInteger(args.limit, 10, 1, 100)));
  const result = runJson(cliArgs);
  if (result.ok && args.redactSensitive !== false) {
    result.data = redact(result.data);
    result.redacted = true;
  }
  return result;
}

function appendPageArgs(cliArgs, args, defaultLimit) {
  if (args.all) {
    cliArgs.push('--all');
  } else {
    cliArgs.push(
      '--page',
      String(clampInteger(args.page, 1, 1, 100000)),
      '--limit',
      String(clampInteger(args.limit, defaultLimit, 1, 100)),
    );
  }
}

function appendRangeArgs(cliArgs, type, values, typeFlag, valueFlag) {
  const normalizedType = type === undefined || type === null ? '' : String(type).trim();
  const normalizedValues = Array.isArray(values)
    ? values.map((value) => String(value).trim()).filter(Boolean)
    : [];
  if (!normalizedType && normalizedValues.length === 0) return null;
  if (!normalizedType) return `${typeFlag} is required when ${valueFlag} is provided.`;
  if (!['GTE', 'LTE', 'BETWEEN'].includes(normalizedType)) {
    return `${typeFlag} must be GTE, LTE, or BETWEEN.`;
  }
  const expectedCount = normalizedType === 'BETWEEN' ? 2 : 1;
  if (normalizedValues.length !== expectedCount) {
    return `${valueFlag} requires ${expectedCount} value(s) when ${typeFlag} is ${normalizedType}.`;
  }
  cliArgs.push(typeFlag, normalizedType);
  for (const value of normalizedValues) cliArgs.push(valueFlag, value);
  return null;
}

function runWithIdentifierRedaction(cliArgs, args) {
  const result = runJson(cliArgs);
  if (result.ok && args.redactSensitive !== false) {
    result.data = redactMatchingKeys(
      result.data,
      /^(memberUid|writerMemberCode|shopCouponIssueCode)$/i,
    );
    result.redacted = true;
  }
  return result;
}

function runFormSubmission(cliArgs, args) {
  const result = runJson(cliArgs);
  if (result.ok && args.redactSensitive !== false) {
    result.data = redactMatchingKeys(
      result.data,
      /^(value|valueList|etcValue|files|writerMemberCode|memberUid|name|email|phone|mobile|cell|tel|call|contact|address|addr|memo|message)$/i,
    );
    result.redacted = true;
  }
  if (result.ok && args.compact !== false) {
    result.data = compactFormSubmissionData(result.data);
    result.compact = true;
    result.compactGuidance = 'Set compact=false only when submitted values are required. Sensitive values remain redacted unless redactSensitive=false is also set.';
  }
  return result;
}

function runJson(args) {
  const ensured = ensureCliReady();
  const bin = ensured.bin;
  if (!bin) {
    return {
      ok: false,
      available: false,
      message: 'imweb CLI was not found on this computer, and automatic plugin-managed CLI install/update did not make it available.',
      searched: candidateBinaries(),
      cliEnsure: ensured.summary,
    };
  }

  const result = run(bin, args, { allowFailure: true, timeout: 120000 });
  if (result.status !== 0) {
    return {
      ok: false,
      path: bin,
      status: result.status,
      stdout: result.stdout.trim(),
      stderr: result.stderr.trim(),
      cliEnsure: ensured.summary,
    };
  }

  try {
    return {
      ok: true,
      path: bin,
      data: JSON.parse(result.stdout),
      cliEnsure: ensured.summary,
    };
  } catch (error) {
    return {
      ok: false,
      path: bin,
      status: result.status,
      message: `imweb returned non-JSON output: ${error.message}`,
      stdout: result.stdout.trim(),
      stderr: result.stderr.trim(),
      cliEnsure: ensured.summary,
    };
  }
}

function ensureCliReady() {
  if (cliEnsureCache) return cliEnsureCache;

  const before = findImwebBinary();
  if (process.env.IMWEB_AI_TOOLKIT_DISABLE_AUTO_CLI_UPDATE === '1') {
    cliEnsureCache = {
      ok: Boolean(before),
      bin: before,
      summary: {
        attempted: false,
        skipped: true,
        reason: 'IMWEB_AI_TOOLKIT_DISABLE_AUTO_CLI_UPDATE=1',
        before,
        after: before,
      },
    };
    return cliEnsureCache;
  }

  const install = cliInstall({});
  const after = findImwebBinary() || before;
  cliEnsureCache = {
    ok: Boolean(after),
    bin: after,
    summary: {
      attempted: true,
      before,
      after,
      install: summarizeInstallResult(install),
    },
  };
  return cliEnsureCache;
}

function summarizeInstallResult(result) {
  return {
    ok: result.ok,
    status: result.status,
    stdout: truncate(result.stdout || '', 4000),
    stderr: truncate(result.stderr || '', 2000),
  };
}

function truncate(value, limit) {
  const text = String(value || '');
  if (text.length <= limit) return text;
  return `${text.slice(0, limit)}\n...[truncated ${text.length - limit} chars]`;
}

function run(command, args, options = {}) {
  const home = hostHome();
  const result = spawnSync(command, args, {
    cwd: home,
    encoding: 'utf8',
    env: {
      ...process.env,
      HOME: home,
      ...(platform() === 'win32' ? { USERPROFILE: home } : {}),
      NO_COLOR: '1',
    },
    timeout: options.timeout || 60000,
  });

  if (result.error && !options.allowFailure) {
    throw result.error;
  }

  return {
    status: result.status ?? (result.error ? 1 : 0),
    stdout: result.stdout || '',
    stderr: result.stderr || (result.error ? String(result.error.message || result.error) : ''),
  };
}

function hostHome() {
  const override = String(process.env.IMWEB_AI_TOOLKIT_HOST_HOME || '').trim();
  if (override) return override;

  try {
    // Desktop apps can replace HOME per task; the OS account home keeps CLI auth shared.
    const accountHome = String(userInfo().homedir || '').trim();
    if (accountHome) return accountHome;
  } catch {
    // Some restricted hosts do not expose the OS account database.
  }

  return homedir();
}

function preferredPowerShell() {
  if (commandExists('pwsh')) return 'pwsh';
  return 'powershell';
}

function commandExists(command) {
  const result = platform() === 'win32'
    ? spawnSync('where', [command], { stdio: 'ignore' })
    : spawnSync('sh', ['-c', 'command -v -- "$1" >/dev/null 2>&1', 'sh', command], { stdio: 'ignore' });
  return result.status === 0;
}

function findImwebBinary() {
  if (process.env.IMWEB_BIN && existsSync(process.env.IMWEB_BIN)) {
    return process.env.IMWEB_BIN;
  }

  if (commandExists('imweb')) {
    return 'imweb';
  }

  for (const candidate of candidateBinaries()) {
    if (existsSync(candidate)) return candidate;
  }
  return null;
}

function candidateBinaries() {
  const home = hostHome();
  const name = platform() === 'win32' ? 'imweb.exe' : 'imweb';
  const candidates = [
    join(home, '.local', 'bin', name),
    join(home, '.local', 'share', 'imweb-cli', 'current', name),
  ];

  if (platform() === 'darwin') {
    candidates.push('/opt/homebrew/bin/imweb', '/usr/local/bin/imweb');
  }

  if (platform() === 'win32') {
    candidates.push(join(home, 'AppData', 'Local', 'imweb-cli', 'current', name));
  }

  return candidates;
}

function clampInteger(value, fallback, min, max) {
  const parsed = Number.parseInt(String(value ?? ''), 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(min, Math.min(max, parsed));
}

function compactFormSubmissionData(data) {
  if (Array.isArray(data)) return data.map(compactFormSubmissionRecord);
  if (!data || typeof data !== 'object') return data;
  if (data.data && typeof data.data === 'object') {
    return {
      ...pickObject(data, ['statusCode']),
      data: compactFormSubmissionData(data.data),
    };
  }
  if (Array.isArray(data.list)) {
    return pickObject(
      {
        ...data,
        list: data.list.map(compactFormSubmissionRecord),
      },
      ['currentPage', 'pageSize', 'totalCount', 'totalPage', 'unitCode', 'list'],
    );
  }
  return compactFormSubmissionRecord(data);
}

function compactFormSubmissionRecord(submission) {
  if (!submission || typeof submission !== 'object') return submission;
  const items = Array.isArray(submission.item)
    ? submission.item.map((item) => pickObject(item, ['itemCode', 'itemType', 'itemSubject']))
    : submission.item;
  return pickObject(
    {
      ...submission,
      item: items,
      itemCount: Array.isArray(submission.item) ? submission.item.length : undefined,
    },
    [
      'unitCode',
      'submitNo',
      'submitCode',
      'formNo',
      'formCode',
      'formName',
      'writerMemberCode',
      'wtime',
      'itemCount',
      'item',
    ],
  );
}

function compactOrderListData(data) {
  if (Array.isArray(data)) return data.map(compactOrderRecord);
  if (!data || typeof data !== 'object') return data;
  if (data.data && typeof data.data === 'object' && Array.isArray(data.data.list)) {
    return {
      ...pickObject(data, ['statusCode']),
      data: compactOrderListData(data.data),
    };
  }
  if (!Array.isArray(data.list)) return data;

  return pickObject(
    {
      ...data,
      list: data.list.map(compactOrderRecord),
    },
    ['currentPage', 'pageSize', 'totalCount', 'totalPage', 'list'],
  );
}

function compactOrderRecord(order) {
  if (!order || typeof order !== 'object') return order;
  return pickObject(
    {
      ...order,
      payments: Array.isArray(order.payments) ? order.payments.map(compactPayment) : order.payments,
      sections: Array.isArray(order.sections) ? order.sections.map(compactSection) : order.sections,
    },
    [
      'orderNo',
      'wtime',
      'orderStatus',
      'isCancelReq',
      'isRequestPayment',
      'device',
      'orderType',
      'saleChannel',
      'currency',
      'totalPaymentPrice',
      'totalPrice',
      'totalDeliveryPrice',
      'totalDiscountPrice',
      'totalRefundPendingPrice',
      'totalRefundedPrice',
      'payments',
      'sections',
    ],
  );
}

function compactPayment(payment) {
  if (!payment || typeof payment !== 'object') return payment;
  return pickObject(payment, [
    'method',
    'paymentStatus',
    'paidPrice',
    'paymentCompleteTime',
    'isCancel',
    'pgName',
  ]);
}

function compactSection(section) {
  if (!section || typeof section !== 'object') return section;
  return pickObject(
    {
      ...section,
      sectionItems: Array.isArray(section.sectionItems)
        ? section.sectionItems.map(compactSectionItem)
        : section.sectionItems,
    },
    [
      'orderSectionNo',
      'orderSectionStatus',
      'deliveryType',
      'deliveryPayType',
      'isDeliveryHold',
      'deliveryPrice',
      'deliverySendTime',
      'deliveryCompleteTime',
      'sectionItems',
    ],
  );
}

function compactSectionItem(item) {
  if (!item || typeof item !== 'object') return item;
  return pickObject(
    {
      ...item,
      productInfo: compactProductInfo(item.productInfo),
    },
    ['orderItemCode', 'orderSectionItemNo', 'qty', 'productInfo'],
  );
}

function compactProductInfo(productInfo) {
  if (!productInfo || typeof productInfo !== 'object') return productInfo;
  return pickObject(productInfo, [
    'prodNo',
    'prodName',
    'itemPrice',
    'baseItemPrice',
    'optionInfo',
    'optionInfoList',
    'isTaxFree',
  ]);
}

function pickObject(source, keys) {
  if (!source || typeof source !== 'object') return source;
  const picked = {};
  for (const key of keys) {
    if (Object.prototype.hasOwnProperty.call(source, key) && source[key] !== undefined) {
      picked[key] = source[key];
    }
  }
  return picked;
}

function redact(value) {
  if (Array.isArray(value)) return value.map((item) => redact(item));
  if (!value || typeof value !== 'object') return value;

  const redacted = {};
  for (const [key, inner] of Object.entries(value)) {
    if (isSensitiveKey(key)) {
      redacted[key] = '[REDACTED]';
    } else {
      redacted[key] = redact(inner);
    }
  }
  return redacted;
}

function redactMatchingKeys(value, keyPattern) {
  if (Array.isArray(value)) return value.map((item) => redactMatchingKeys(item, keyPattern));
  if (!value || typeof value !== 'object') return value;

  const redacted = {};
  for (const [key, inner] of Object.entries(value)) {
    if (keyPattern.test(key)) {
      redacted[key] = '[REDACTED]';
    } else {
      redacted[key] = redactMatchingKeys(inner, keyPattern);
    }
  }
  return redacted;
}

function isSensitiveKey(key) {
  return /name|email|phone|mobile|cell|tel|call|contact|address|addr|zip|postal|postcode|bank|account|depositor|receiver|recipient|customer|buyer|member|memo|message|password|token|secret/i.test(key);
}

function redactLoginOutput(text) {
  return String(text || '')
    .replace(/https?:\/\/\S+/g, '[REDACTED_URL]')
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, '[REDACTED_EMAIL]');
}
