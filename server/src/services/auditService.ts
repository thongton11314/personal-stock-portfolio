import path from 'path';
import fs from 'fs/promises';
import { ensureDir, getAuditDir } from '../utils/fileSystem';

export async function appendAuditEntry(
  action: string,
  user: string,
  details: Record<string, unknown>
): Promise<void> {
  const now = new Date();
  const yearMonth = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}`;
  const filePath = path.join(getAuditDir(), `${yearMonth}.md`);

  await ensureDir(getAuditDir());

  const entry = `\n## ${now.toISOString()} | ${action}\n- **User**: ${user}\n${
    Object.entries(details)
      .map(([key, value]) => `- **${key}**: ${value}`)
      .join('\n')
  }\n`;

  await fs.appendFile(filePath, entry, 'utf-8');
}
