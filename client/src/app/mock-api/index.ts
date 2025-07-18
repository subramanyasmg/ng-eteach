import { inject, Injectable } from '@angular/core';
import { AcademyMockApi } from 'app/mock-api/apps/academy/api';
import { ChatMockApi } from 'app/mock-api/apps/chat/api';
import { ContactsMockApi } from 'app/mock-api/apps/contacts/api';
import { ECommerceInventoryMockApi } from 'app/mock-api/apps/ecommerce/inventory/api';
import { FileManagerMockApi } from 'app/mock-api/apps/file-manager/api';
import { HelpCenterMockApi } from 'app/mock-api/apps/help-center/api';
import { MailboxMockApi } from 'app/mock-api/apps/mailbox/api';
import { NotesMockApi } from 'app/mock-api/apps/notes/api';
import { ScrumboardMockApi } from 'app/mock-api/apps/scrumboard/api';
import { TasksMockApi } from 'app/mock-api/apps/tasks/api';
import { AuthMockApi } from 'app/mock-api/common/auth/api';
import { MessagesMockApi } from 'app/mock-api/common/messages/api';
import { NotificationsMockApi } from 'app/mock-api/common/notifications/api';
import { ShortcutsMockApi } from 'app/mock-api/common/shortcuts/api';
import { UserMockApi } from 'app/mock-api/common/user/api';
import { AnalyticsMockApi } from 'app/mock-api/dashboards/analytics/api';
import { CryptoMockApi } from 'app/mock-api/dashboards/crypto/api';
import { FinanceMockApi } from 'app/mock-api/dashboards/finance/api';
import { ProjectMockApi } from 'app/mock-api/dashboards/project/api';
import { ActivitiesMockApi } from 'app/mock-api/pages/activities/api';
import { IconsMockApi } from 'app/mock-api/ui/icons/api';

@Injectable({ providedIn: 'root' })
export class MockApiService {
    academyMockApi = inject(AcademyMockApi);
    activitiesMockApi = inject(ActivitiesMockApi);
    analyticsMockApi = inject(AnalyticsMockApi);
    authMockApi = inject(AuthMockApi);
    chatMockApi = inject(ChatMockApi);
    contactsMockApi = inject(ContactsMockApi);
    cryptoMockApi = inject(CryptoMockApi);
    eCommerceInventoryMockApi = inject(ECommerceInventoryMockApi);
    fileManagerMockApi = inject(FileManagerMockApi);
    financeMockApi = inject(FinanceMockApi);
    helpCenterMockApi = inject(HelpCenterMockApi);
    iconsMockApi = inject(IconsMockApi);
    mailboxMockApi = inject(MailboxMockApi);
    messagesMockApi = inject(MessagesMockApi);
    notesMockApi = inject(NotesMockApi);
    notificationsMockApi = inject(NotificationsMockApi);
    projectMockApi = inject(ProjectMockApi);
    scrumboardMockApi = inject(ScrumboardMockApi);
    shortcutsMockApi = inject(ShortcutsMockApi);
    tasksMockApi = inject(TasksMockApi);
    userMockApi = inject(UserMockApi);
}
