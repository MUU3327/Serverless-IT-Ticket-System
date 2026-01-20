// Ticket System Script
// 请把你工单系统 Sheets 里的 Apps Script 代码复制到这里
// ============================================
// 1️⃣ 新工单提交通知 IT（HTML 邮件 + 附件链接 + 短工单编号）
// ============================================
function sendNotificationEmail(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Form Responses 1");
  var row = sheet.getLastRow(); // 获取当前最新提交行

  // -----------------------------
  // 生成短工单编号
  // -----------------------------
  var now = new Date();
  var yy = ('' + now.getFullYear()).slice(-2); // 年后两位
  var mm = ('0' + (now.getMonth() + 1)).slice(-2);
  var dd = ('0' + now.getDate()).slice(-2);

  // 获取当天已有工单数量
  var data = sheet.getRange(2, 11, row-1).getValues(); // 第11列 K列
  var todayCount = 0;
  var todayStr = yy + mm + dd;
  data.forEach(function(item){
    if(item[0] && item[0].toString().includes(todayStr)) todayCount++;
  });
  var seq = ('00' + (todayCount + 1)).slice(-2); // 两位顺序号
  var ticketNumber = "TCK" + yy + mm + dd + seq;

  // 写入工单编号到第11列
  sheet.getRange(row, 11).setValue(ticketNumber);

  // -----------------------------
  // 邮件内容准备
  // -----------------------------
  var notifyEmail = "IT@company.com"; // IT 邮箱
  var timestamp = e.values[0];
  var email = e.values[1];
  var issueType = e.values[2];
  var summary = e.values[3];
  var details = e.values[4];
  var assetNumber = e.values[5];
  var attachmentsRaw = e.values[6];

  var attachmentListHtml = "";
  if (attachmentsRaw) {
    var attachmentLinks = attachmentsRaw.split(",").map(function(link) { return link.trim(); });
    attachmentLinks.forEach(function(link) {
      try {
        var fileIdMatch = link.match(/[-\w]{25,}/);
        if (fileIdMatch) {
          var file = DriveApp.getFileById(fileIdMatch[0]);
          attachmentListHtml += "<a href='" + link + "'>" + file.getName() + "</a><br>";
        }
      } catch (err) {
        Logger.log("无法获取附件: " + link);
        attachmentListHtml += "无法获取附件: " + link + "<br>";
      }
    });
  }

  var subject = "New IT Ticket Submitted: " + ticketNumber + " - " + summary;

// -----------------------------
  // 替换为全新的 HTML 邮件模板 (Light Version)
  // -----------------------------
  var messageHtml = `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Jost:wght@400;700&display=swap');
        </style>
    </head>
    <body style="font-family: 'Jost', sans-serif; background-color: #e0f1f5; margin: 0; padding: 0;">

        <div style="background-color: #11a7bc; height: 100px; position: relative; overflow: hidden;">
            <div style="background-color: #e0f1f5; width: 150%; height: 150px; transform: rotate(-5deg); position: absolute; top: -50px; left: -25%; z-index: 1;"></div>
        </div>

        <div style="background-color: #e0f1f5; padding: 40px 0;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);">
                
                <div style="padding: 40px; text-align: center; border-bottom: 1px solid #e0e0e0;">
                    <h1 style="font-size: 2.2em; font-weight: 700; margin: 0; color: #11a7bc; letter-spacing: 2px;">VO2 APAC IT HELP</h1>
                </div>

                <div style="padding: 40px;">
                    <p style="text-align: center; font-size: 1.1em; color: #333333; margin-top: 0; margin-bottom: 40px;">
                        A new IT ticket has been submitted for your review.
                    </p>

                    <div style="background-color: #f7f7f7; padding: 30px; border-radius: 8px; border-left: 4px solid #11a7bc; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);">
                        <div style="margin-bottom: 20px;">
                            <span style="font-size: 0.9em; color: #888888; text-transform: uppercase; letter-spacing: 1px;">Ticket Number</span><br>
                            <span style="font-size: 1.2em; font-weight: 700; color: #333333;">${ticketNumber}</span>
                        </div>

                        <div style="margin-bottom: 20px;">
                            <span style="font-size: 0.9em; color: #888888; text-transform: uppercase; letter-spacing: 1px;">Submitted At</span><br>
                            <span style="font-size: 1.1em; font-weight: 400; color: #333333;">${timestamp}</span>
                        </div>

                        <div style="margin-bottom: 20px;">
                            <span style="font-size: 0.9em; color: #888888; text-transform: uppercase; letter-spacing: 1px;">Submitted By</span><br>
                            <span style="font-size: 1.1em; font-weight: 400; color: #11a7bc;"><a href="mailto:${email}" style="color: #11a7bc; text-decoration: none;">${email}</a></span>
                        </div>

                        <div style="margin-bottom: 20px;">
                            <span style="font-size: 0.9em; color: #888888; text-transform: uppercase; letter-spacing: 1px;">Issue Type</span><br>
                            <span style="font-size: 1.1em; font-weight: 400; color: #333333;">${issueType}</span>
                        </div>

                        <div style="margin-bottom: 20px;">
                            <span style="font-size: 0.9em; color: #888888; text-transform: uppercase; letter-spacing: 1px;">Summary</span><br>
                            <span style="font-size: 1.1em; font-weight: 400; color: #333333;">${summary}</span>
                        </div>
                        
                        <div style="margin-bottom: 20px;">
                            <span style="font-size: 0.9em; color: #888888; text-transform: uppercase; letter-spacing: 1px;">Details</span><br>
                            <span style="font-size: 1.1em; font-weight: 400; color: #333333;">${details}</span>
                        </div>

                        <div style="margin-bottom: 20px;">
                            <span style="font-size: 0.9em; color: #888888; text-transform: uppercase; letter-spacing: 1px;">Asset Number</span><br>
                            <span style="font-size: 1.1em; font-weight: 400; color: #333333;">${assetNumber}</span>
                        </div>

                        <div style="margin-bottom: 0;">
                            <span style="font-size: 0.9em; color: #888888; text-transform: uppercase; letter-spacing: 1px;">Attachments</span><br>
                            <span style="font-size: 1.1em; font-weight: 400; color: #333333;">${attachmentListHtml || "No attachments"}</span>
                        </div>
                    </div>

                    <div style="text-align: center; margin-top: 40px;">
                        <a href="https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID" style="display: inline-block; padding: 12px 30px; background-color: #11a7bc; color: #ffffff; text-decoration: none; border-radius: 50px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; box-shadow: 0 4px 15px rgba(17, 167, 188, 0.4);">
                            Review Ticket
                        </a>
                    </div>
                </div>
                
                <div style="padding: 20px; text-align: center; font-size: 0.8em; color: #888888; border-top: 1px solid #e0e0e0;">
                    <p style="margin: 0 0 5px;">This is an automated message. Please do not reply.</p>
                    <p style="margin: 0;">© 2025 VO2 Group. All rights reserved.</p>
                </div>
                
            </div>
        </div>
    </body>
    </html>
  `;

  // 始终只发送附件链接，不附加文件
  MailApp.sendEmail({
    to: notifyEmail,
    subject: subject,
    htmlBody: messageHtml
  });
}

// ============================================
// 2️⃣ Notify Submitter when Work Order is Completed or In Progress (HTML Email)
// ============================================
function onEdit(e) {
  var sheet = e.range.getSheet();
  if(sheet.getName() !== "Form Responses 1") return;

  var row = e.range.getRow();
  var col = e.range.getColumn();

  var statusColumn = 8; // Work order status column (H column, based on your image)
  var completionNotifyFlagColumn = 9; // Completion notification flag column (I column)
  var inProgressNotifyFlagColumn = 12; // NEW: In Progress notification flag column (L column, adjust if different)
  var completionTimeColumn = 10; // Completion time column (J column)

  // Only proceed if the edited column is the status column and it's not the header row
  if(col !== statusColumn || row === 1) return;

  var status = e.value;
  var previousStatus = e.oldValue; // Get the previous value of the cell

  // ----------------------------------------
  // Get common dynamic data for both notifications
  // ----------------------------------------
  var email = sheet.getRange(row, 2).getValue();       // Email (column 2)
  var summary = sheet.getRange(row, 4).getValue();     // Issue summary (column 4)
  var ticketNumber = sheet.getRange(row, 11).getValue(); // Work order number (column 11)
  var processedBy = "IT";                   // Processor, you might fetch this dynamically later

  // ============================================
  // 💡 New: Send "In progress" notification
  // ============================================
  if(status === "In progress" && previousStatus !== "In progress") { // Only send if status changed TO "In progress"
    var inProgressNotifySent = sheet.getRange(row, inProgressNotifyFlagColumn).getValue();

    if(inProgressNotifySent !== "Yes") { // Only send if not already sent for "In progress"
      var subject = "IT Ticket Update: " + ticketNumber + " - " + summary + " (In Progress)";
      var messageHtml = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Jost:wght@400;500;600;700&display=swap');
            </style>
        </head>
        <body style="font-family: 'Jost', sans-serif; background-color: #e0f1f5; margin: 0; padding: 0; line-height: 1.6;">
            <div style="background-color: #e0f1f5; padding-top: 40px; padding-bottom: 40px;">
              <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);">
                  <div style="padding: 30px 40px 20px; text-align: center; border-bottom: 1px solid #e0e0e0;">
                      <h1 style="font-size: 28px; font-weight: 700; margin: 0; color: #11a7bc; letter-spacing: 1px;">VO2 APAC IT Help</h1>
                  </div>
                  <div style="padding: 40px;">
                      <div style="text-align: center; margin-bottom: 30px;">
                          <div style="font-size: 50px; line-height: 1; color: #f39c12; margin-bottom: 10px; font-weight: 900;">⚙️</div> <!-- Cogwheel emoji for "in progress" -->
                          <div style="font-size: 20px; font-weight: 600; color: #f39c12; text-transform: uppercase;">TICKET IN PROGRESS</div>
                      </div>
                      
                      <p style="text-align: center; font-size: 18px; color: #333333; margin-top: 0; margin-bottom: 15px;">
                          Good news! Your IT ticket is now being actively processed.
                      </p>

                      <div style="display: block; text-align: center;">
                          <div style="margin-bottom: 25px;">
                              <div style="font-size: 14px; color: #888888; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 5px;">Summary</div>
                              <div style="font-size: 16px; font-weight: 500; color: #222222;">${summary}</div>
                          </div>
                          <div style="margin-bottom: 25px;">
                              <div style="font-size: 14px; color: #888888; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 5px;">Ticket Number</div>
                              <div style="font-size: 16px; font-weight: 500; color: #222222;">${ticketNumber}</div>
                          </div>
                          <div style="margin-bottom: 25px;">
                              <div style="font-size: 14px; color: #888888; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 5px;">Submitted by</div>
                              <div style="font-size: 16px; font-weight: 500; color: #222222;">${email}</div>
                          </div>
                          <div style="margin-bottom: 25px;">
                              <div style="font-size: 14px; color: #888888; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 5px;">Processed by</div>
                              <div style="font-size: 16px; font-weight: 500; color: #222222;">${processedBy}</div>
                          </div>
                      </div>
                  </div>
                  <div style="text-align: center; font-size: 12px; color: #888888; padding: 20px 0 40px; border-top: 1px solid #e0e0e0;">
                      <p style="margin: 0;">This is an automated message. Please do not reply.</p>
                      <p style="margin: 5px 0 0;">© 2025 VO2 Group. All rights reserved.</p>
                  </div>
              </div>
            </div>
        </body>
        </html>
      `;

      MailApp.sendEmail({
        to: email,
        subject: subject,
        htmlBody: messageHtml
      });

      // Mark "In progress" notification as sent
      sheet.getRange(row, inProgressNotifyFlagColumn).setValue("Yes");
    }
  }

  // ============================================
  // Existing: Send "Done" notification
  // ============================================
  if(status === "Done" && previousStatus !== "Done") { // Only send if status changed TO "Done"
    var completionNotifySent = sheet.getRange(row, completionNotifyFlagColumn).getValue();

    if(completionNotifySent !== "Yes") {
      var subject = "IT Ticket Closed: " + ticketNumber + " - " + summary;
      var messageHtml = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Jost:wght@400;500;600;700&display=swap');
            </style>
        </head>
        <body style="font-family: 'Jost', sans-serif; background-color: #e0f1f5; margin: 0; padding: 0; line-height: 1.6;">
            <div style="background-color: #e0f1f5; padding-top: 40px; padding-bottom: 40px;">
              <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);">
                  <div style="padding: 30px 40px 20px; text-align: center; border-bottom: 1px solid #e0e0e0;">
                      <h1 style="font-size: 28px; font-weight: 700; margin: 0; color: #11a7bc; letter-spacing: 1px;">VO2 APAC IT Help</h1>
                  </div>
                  <div style="padding: 40px;">
                      <div style="text-align: center; margin-bottom: 30px;">
                          <div style="font-size: 50px; line-height: 1; color: #11a7bc; margin-bottom: 10px; font-weight: 900;">✓</div>
                          <div style="font-size: 20px; font-weight: 600; color: #11a7bc; text-transform: uppercase;">TICKET RESOLVED</div>
                      </div>
                      
                      <p style="text-align: center; font-size: 18px; color: #333333; margin-top: 0; margin-bottom: 15px;">
                          Your ticket has been successfully resolved.
                      </p>

                      <div style="display: block; text-align: center;">
                          <div style="margin-bottom: 25px;">
                              <div style="font-size: 14px; color: #888888; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 5px;">Summary</div>
                              <div style="font-size: 16px; font-weight: 500; color: #222222;">${summary}</div>
                          </div>
                          <div style="margin-bottom: 25px;">
                              <div style="font-size: 14px; color: #888888; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 5px;">Ticket Number</div>
                              <div style="font-size: 16px; font-weight: 500; color: #222222;">${ticketNumber}</div>
                          </div>
                          <div style="margin-bottom: 25px;">
                              <div style="font-size: 14px; color: #888888; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 5px;">Submitted by</div>
                              <div style="font-size: 16px; font-weight: 500; color: #222222;">${email}</div>
                          </div>
                          <div style="margin-bottom: 25px;">
                              <div style="font-size: 14px; color: #888888; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 5px;">Processed by</div>
                              <div style="font-size: 16px; font-weight: 500; color: #222222;">${processedBy}</div>
                          </div>
                      </div>
                  </div>
                  <div style="text-align: center; font-size: 12px; color: #888888; padding: 20px 0 40px; border-top: 1px solid #e0e0e0;">
                      <p style="margin: 0;">This is an automated message. Please do not reply.</p>
                      <p style="margin: 5px 0 0;">© 2025 VO2 Group. All rights reserved.</p>
                  </div>
              </div>
            </div>
        </body>
        </html>
      `;

      MailApp.sendEmail({
        to: email,
        subject: subject,
        htmlBody: messageHtml
      });

      // Mark completion notification as sent
      sheet.getRange(row, completionNotifyFlagColumn).setValue("Yes");

      // Automatically record completion time
      sheet.getRange(row, completionTimeColumn).setValue(new Date());
    }
  }
}
