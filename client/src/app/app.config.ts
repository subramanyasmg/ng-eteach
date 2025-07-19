import { provideHttpClient } from '@angular/common/http';
import {
    ApplicationConfig,
    inject,
    isDevMode,
    provideAppInitializer,
} from '@angular/core';
import { LuxonDateAdapter } from '@angular/material-luxon-adapter';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { provideFuse } from '@fuse';
import { TranslocoService, provideTransloco } from '@jsverse/transloco';
import { appRoutes } from 'app/app.routes';
import { provideAuth } from 'app/core/auth/auth.provider';
import { provideIcons } from 'app/core/icons/icons.provider';
import { MockApiService } from 'app/mock-api';
import { provideQuillConfig } from 'ngx-quill/config';
import { firstValueFrom } from 'rxjs';
import { TranslocoHttpLoader } from './core/transloco/transloco.http-loader';
import { provideState, provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { curriculumReducer } from './state/curriculum/curriculum.reducer';
import { CurriculumEffects } from './state/curriculum/curriculum.effects';
import { gradeReducer } from './state/grades/grades.reducer';
import { GradesEffects } from './state/grades/grades.effects';
import { subjectsReducer } from './state/subjects/subjects.reducer';
import { SubjectsEffects } from './state/subjects/subjects.effects';
import { instituteReducer } from './state/institute/institute.reducer';
import { InstituteEffects } from './state/institute/institute.effects';
import { chaptersReducer } from './state/chapters/chapters.reducer';
import { ChaptersEffects } from './state/chapters/chapters.effects';
import { teacherReducer } from './state/teachers/teacher.reducer';
import { TeacherEffects } from './state/teachers/teacher.effects';
import { publisherReducer } from './state/publishers/publishers.reducer';
import { PublisherEffects } from './state/publishers/publishers.effects';
import { providePrimeNG } from 'primeng/config';
import Material from '@primeuix/themes/material';

export const appConfig: ApplicationConfig = {
    providers: [
        providePrimeNG({
            theme: {
                preset: Material,
                 options: {
                    darkModeSelector: false || 'none'
                }
            }
        }),
        provideStore(),
        provideAnimations(),
        provideHttpClient(),
        provideRouter(
            appRoutes,
            withInMemoryScrolling({ scrollPositionRestoration: 'enabled',  anchorScrolling: 'enabled' })
        ),

        // Material Date Adapter
        {
            provide: DateAdapter,
            useClass: LuxonDateAdapter,
        },
        {
            provide: MAT_DATE_FORMATS,
            useValue: {
                parse: {
                    dateInput: 'D',
                },
                display: {
                    dateInput: 'DDD',
                    monthYearLabel: 'LLL yyyy',
                    dateA11yLabel: 'DD',
                    monthYearA11yLabel: 'LLLL yyyy',
                },
            },
        },

        // Transloco Config
        provideTransloco({
            config: {
                availableLangs: [
                    {
                        id: 'en',
                        label: 'English',
                    },
                    {
                        id: 'tr',
                        label: 'Turkish',
                    },
                ],
                defaultLang: 'en',
                fallbackLang: 'en',
                reRenderOnLangChange: true,
                prodMode: !isDevMode(),
            },
            loader: TranslocoHttpLoader,
        }),
        provideAppInitializer(() => {
            const translocoService = inject(TranslocoService);
            const defaultLang = translocoService.getDefaultLang();
            translocoService.setActiveLang(defaultLang);

            return firstValueFrom(translocoService.load(defaultLang));
        }),

        // Fuse
        provideAuth(),
        provideIcons(),
        provideFuse({
            mockApi: {
                delay: 0,
                service: MockApiService,
            },
            fuse: {
                layout: 'classic',
                scheme: 'light',
                screens: {
                    sm: '600px',
                    md: '960px',
                    lg: '1280px',
                    xl: '1440px',
                },
                theme: 'theme-default',
                themes: [
                    {
                        id: 'theme-default',
                        name: 'Default',
                    },
                    {
                        id: 'theme-brand',
                        name: 'Brand',
                    },
                    {
                        id: 'theme-teal',
                        name: 'Teal',
                    },
                    {
                        id: 'theme-rose',
                        name: 'Rose',
                    },
                    {
                        id: 'theme-purple',
                        name: 'Purple',
                    },
                    {
                        id: 'theme-amber',
                        name: 'Amber',
                    },
                ],
            },
        }),
        provideQuillConfig({
            modules: {
                syntax: false,
                toolbar: [
                    ['bold', 'italic', 'underline'],
                    ['blockquote'],
                    [{ 'list': 'ordered'}, { 'list': 'bullet' }, { 'list': 'check' }],
                    [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
                    ['link']
                ]
            }
        }),
        provideState('publisher', publisherReducer),
        provideEffects(PublisherEffects),
        provideState('curriculum', curriculumReducer),
        provideEffects(CurriculumEffects),
        provideState('grades', gradeReducer),
        provideEffects(GradesEffects),
        provideState('subjects', subjectsReducer),
        provideEffects(SubjectsEffects),
        provideState('institute', instituteReducer),
        provideEffects(InstituteEffects),
        provideState('chapters', chaptersReducer),
        provideEffects(ChaptersEffects),
        provideState('teachers', teacherReducer),
        provideEffects(TeacherEffects)
    ],
};
