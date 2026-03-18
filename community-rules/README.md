# 🍱 Sentinel Community Rules Cookbook

A library of community-contributed `.sentinelrules.yaml` recipes for specific frameworks, security standards, and coding patterns.

## 🚀 How to use these rules
To use any of these recipes in your project, copy the rules from the `.yaml` files in the `rules/` directory and paste them into your project's `.sentinelrules.yaml` file.

Alternatively, you can merge multiple rule sets to build a robust, custom guardrail for your codebase.

## 🍳 Available Recipes
| Recipe | Focus |
|--------|-------|
| [Next.js Security](rules/nextjs-security.yaml) | Protects against SSR/API route vulnerabilities |
| [AWS CDK Best Practices](rules/aws-cdk-security.yaml) | Security checks for Infrastructure as Code |
| [General Web Performance](rules/web-performance.yaml) | Performance-killing patterns in JS/TS |

## 👨‍🍳 Contributing a Recipe
We love community recipes! To contribute, follow these steps:
1. Create a new `.yaml` file in the `rules/` directory.
2. Ensure your rules follow the Sentinel rule schema (see the [main documentation](https://github.com/KunjShah95/SENTINEL-CLI#custom-rules) for reference).
3. Test your rules locally using `sentinel analyze --rules rules/your-new-rule.yaml`.
4. Submit a PR titled `Recipe: [Framework/Topic] rules`.

### Why contribute?
Sentinel's strength is its community. By sharing rules, you help thousands of developers catch bugs and security issues in the specific tech stacks you know best.

---
_Every recipe makes the Sentinel network smarter. Let's make code safer together._ 🛡️
