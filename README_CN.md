# 🛠️ Serverless IT 工单管理系统 (Google Workspace)

[![English](https://img.shields.io/badge/Language-English-blue)](./README.md)
![Platform](https://img.shields.io/badge/Platform-Google%20Workspace-blue)
![Stack](https://img.shields.io/badge/技术栈-Sites%20%7C%20Forms%20%7C%20Sheets%20%7C%20Apps%20Script-green)
![Status](https://img.shields.io/badge/状态-已上线-brightgreen)

> **[ 🇺🇸 Click here for English Version ](./README.md)**

## 📖 项目简介

这是一个专为中小企业（SMBs）设计的全功能、**无服务器架构（Serverless）** 的 IT 服务管理（ITSM）解决方案。

该系统完全基于 **Google Workspace** 生态构建。它为员工提供了一个统一的故障报修门户，并为 IT 团队提供了一个结构化的后台来管理工单、追踪 SLA 并实现邮件通知自动化——且**无需购买额外的软件许可**（如 Jira 或 ServiceNow），实现零成本运营。

## 🏗️ 架构与工作流

本系统采用前后端分离的低代码架构：

1.  **前端门户 (Frontend)**：使用 **Google Sites** 作为企业内部 IT 入口。
2.  **数据录入 (Input)**：使用 **Google Forms** 收集结构化数据（问题类型、资产编号、附件）。
3.  **数据库 (Database)**：使用 **Google Sheets** 作为实时数据库。
4.  **自动化后端 (Logic)**：使用 **Google Apps Script** 处理业务逻辑、状态流转和通知推送。

### 流程图
![Workflow](assets/01_architecture_flow.png)

---

## ✨ 核心功能

*   **🎨 自助服务门户**：员工可在此查询 FAQ 并提交工单。
*   **🆔 自动编号系统**：基于日期和序列自动生成唯一工单号（如 `TCK26011901`）。
*   **📧 HTML 邮件通知**：
    *   **用户侧**：在工单创建、处理中、已解决三个阶段收到即时反馈。
    *   **IT 侧**：收到包含资产详情和附件直链的富文本告警邮件。
*   **🔄 状态机逻辑**： 
    *   状态变更为 `In Progress`（处理中）-> 触发用户通知。
    *   状态变更为 `Done`（已完成）-> 触发结单通知并记录完成时间戳。
*   **📊 幂等性设计**：通过标志位（Flag Columns）防止同一状态更新重复发送邮件。

---

## 📸 系统截图

### 1. IT 支持门户首页 (Google Sites)
*集成了工单提交入口与知识库。*
![Portal](assets/02_portal_home.png)

### 2. 自动化邮件通知
*通过 Apps Script 触发的专业 HTML 邮件模板。*
![Email](assets/04_email_notification.png)

### 3. IT 管理后台 (Google Sheets)
*IT 人员用于管理状态和追踪 SLA 的结构化视图。*
![Database](assets/05_database_view.png)

---

## 💻 核心代码逻辑 (Google Apps Script)

自动化核心逻辑位于 `src/Backend_Logic.js`。

### 触发器 1：新工单提交 (Ingress)
当表单提交时，脚本执行：
1.  计算当日唯一工单 ID。
2.  解析表单数据（自动处理 Drive 附件权限）。
3.  发送格式化的 HTML 邮件给 IT 团队。

### 触发器 2：状态更新 (Event-Driven)
脚本监听 **Status** 列的编辑事件，实现事件驱动通知：

```javascript
function onEdit(e) {
  // 检测状态是否变更为 "Done"
  if(status === "Done" && prevStatus !== "Done" && !isNotified) {
     // 发送结单邮件
     MailApp.sendEmail({
       to: userEmail,
       subject: `工单已解决: ${ticketID}`,
       htmlBody: getHtmlTemplate_Resolved(ticketID)
     });
     // 标记为“已通知”，防止重复发送 (幂等性)
     sheet.getRange(row, COLS.NOTIFY_DONE).setValue("Yes");
  }
}