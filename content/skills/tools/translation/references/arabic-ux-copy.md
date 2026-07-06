# Arabic UX/UI Copy

Use this for Arabic interface copy: buttons, labels, errors, success messages, empty states, forms, onboarding, tooltips, modals, notifications, headings, settings, permissions, checkout, subscriptions, and terminology.

## Fast Workflow

1. Identify the surface, user goal, audience, register, space limit, placeholders, plural logic, and surrounding UI.
2. Write in فصحى مبسطة by default: purposeful, concise, natural, clear.
3. Match existing product choices for gender, numerals, currency, punctuation, terminology, and system-action voice.
4. Preserve variables, tags, links, product names, emails, filenames, codes, SKUs, API names, plan IDs, and ICU syntax exactly.
5. Final check: useful next step, no literal English structure, correct RTL/mixed text, correct plural handling, no broken placeholder order.

## Defaults

- Register: فصحى مبسطة; go more formal for legal, privacy, payment, government, or policy text.
- Tone: errors are specific and recoverable; success is brief; destructive actions are calm and explicit.
- Gender: keep the product's strategy. If none exists, use masculine imperative for direct actions; use masdar labels for neutral/formal menus; use personalized gender only with reliable data and rendering support.
- Numerals: keep the product style. If none exists, Western digits are common in tech; Eastern digits suit products/locales already using them.
- Diacritics: avoid unless needed to prevent ambiguity.
- Dialect: colloquial words are allowed only when the product voice deliberately uses a lighter local register; call them عامية or regional only when that affects fit.

## Surface Patterns

- Buttons: name the action, not the interaction. Use `حذف الحساب`, `تسجيل الدخول`, `حفظ التغييرات`; avoid `اضغط هنا`, `انقر`, vague `موافق` for consequential actions.
- Errors: what happened + recovery. Use `تعذّر الحفظ. تحقق من اتصالك.` not `حدث خطأ غير معروف`. Avoid blame like `بيانات خاطئة`; name the field or fix.
- Success: result first; add next step only if useful. If the user acted, address the completed action: `أكملت القراءة`. If the system acted, choose one product-wide style: light passive `حُفظت التغييرات`, active نحن `أرسلنا الرسالة`, or nominal `حسابك جاهز`.
- Empty states: why empty + next useful action. Prefer `لا توجد نتائج لـ"{query}". جرّب كلمة أخرى.` or `لم نجد نتائج لـ"{query}"` over `لم يتم العثور على نتائج`.
- Forms: labels are stable nouns (`البريد الإلكتروني`, `رقم الهاتف`). Placeholders are examples, not hidden labels. Helpers are short (`8 أحرف على الأقل`). Validation says exactly what to fix.
- Notifications: title and body complement each other. Title under 40 characters when possible.
- Modals/destructive actions: state consequence, irreversibility, primary action, and cancel action. Example: title `حذف الحساب؟`, body `سيُحذف حسابك وبياناتك نهائيًا. لا يمكن التراجع.`, primary `حذف الحساب`, secondary `إلغاء`.
- Permission prompts: explain benefit before permission. Example: `فعّل الإشعارات` + `سننبهك عند تحديث حالة طلبك.` + `تفعيل الإشعارات` / `ليس الآن`.

## Anti-Patterns

| Avoid | Prefer |
|---|---|
| `تم` + مصدر for passive events | direct past for user actions, light passive, active نحن, or nominal result |
| `تم حفظ التغييرات بنجاح` | `حُفظت التغييرات` or `حفظنا التغييرات` |
| heavy passive like `سُجِّل` when it sounds forced | `سجّلنا حسابك` or `حسابك جاهز` |
| `قم بـ`, `القيام بـ`, `لقد قمت بـ` | direct verb or result: `أنشئ حسابك`, `حسابك جاهز` |
| `الخاص بك` | possessive suffix: `حسابك`, `طلبك`, `إعداداتك` |
| `من أجل` where `لـ` works | `لإكمال التسجيل`, `لحفظ التغييرات` |
| routine `يرجى` | direct instruction; reserve politeness for sensitive/error contexts |
| filler `بنجاح`, `عملية`, `هذا/هذه`, `هنا`, padded `الذي/التي` | remove unless meaning changes |
| unnecessary `هو/هي` in nominal sentences | `حسابك جاهز`, `كلمة المرور مطلوبة` |
| existential `هناك` | front-load content: `في سلتك 3 عناصر`, `تحديث متاح`, `لا رسائل` |
| conditional `عندما` | `إذا` for expected choices, `إن` for uncertain problems, `عندما` for real time events |
| `بشكل` + adjective | مصدر/حال/direct adverb: `دائمًا`, `آليًا`, `كما ينبغي` |
| English SVO skeleton | action-first Arabic: `سيصلك إشعار`, `يمكنك التحديث` |
| slash alternatives | `أو`: `البريد الإلكتروني أو رقم الهاتف` |

Semantic calques to catch: `حقل` -> `خانة`, `تحت المراجعة` -> `قيد المراجعة`, `يشير إلى` -> `يعني`/`يدل على`, `بناءً على` -> `حسب`/`وفق`, `بسيط` for easy -> `سهل`/`يسير`, `الخطة` for subscription tier -> `الباقة`, `نأسف` in errors -> `عذرًا` or omit apology, `ذات صلة` -> `مناسبة`/`ملائمة`, `يدعم` for compatibility -> `يعمل على`/`متوافق مع`.

## Grammar And Formatting

- Use Arabic comma `،`, not English comma, in Arabic sentences.
- Avoid em dash in Arabic copy; use comma, colon, parentheses, or split the sentence.
- Use punctuation sparingly; avoid `!!`, `...`, decorative punctuation, and colon after standalone headings.
- Present-tense verbs ending in و do not take extra alif: `نرجو`, `يدعو`, `يرجو`.
- Tanween before hamza after alif: `مساءً`, `بناءً`, `أداءً`, not `مساءًا`.
- Distinguish `ة` and `ه`; dual test helps: `رسالة` -> `رسالتان`, `وجه` -> `وجهان`.
- Hamzat al-wasl vs qat': `استخدام` but `إرسال`; test by adding `و`.
- Do not split إضافة: `سهولة الاستخدام وسرعته`, not `سهولة وسرعة الاستخدام`.
- Do not repeat `كلما`: `كلما أسرعت، ضمنت مكانك`.
- اسم التفضيل on `أفعل` only works when the source verb allows it. If awkward or not derivable, use `أكثر/أشد` or a clearer adjective.
- Use اسم المفعول for states (`حسابك مُفعّل`, `مُرسَل`, `محفوظ`) and verbs for events (`فعّلنا حسابك`, `أُرسل طلبك`).

## Plurals And Tokens

- Arabic count categories are not English singular/plural. Use proper i18n categories when count is dynamic.
- Common forms: 0 `لا توجد رسائل`, 1 `رسالة واحدة`, 2 `رسالتان`, 3-10 `{count} رسائل`, 11+ `{count} رسالة`.
- Keep placeholders and ICU syntax intact: `{name}`, `{count}`, `%s`, `%d`, `$1`, `{{userName}}`, `{count, plural, one {...} other {...}}`, HTML/React tags.
- You may reorder surrounding Arabic words for grammar, but do not alter token spelling.
- Keep mixed RTL/LTR strings short and visually check emails, codes, product names, coupon codes, and currencies.

## Huroof And Prepositions

| Context | Use | Example | Avoid |
|---|---|---|---|
| price/cost/exchange | `بـ` | `توصيل بريال`, `اشترك بـ 29 ريالًا` | `من ريال` for a price |
| payment method/tool | `بـ` | `ادفع بالبطاقة`, `سجّل بـ Google` | `من البطاقة` |
| starting time/threshold | `من` | `متاح من الساعة 9`, `من 50 ريالًا` | `بالساعة 9` |
| destination/target | `إلى` | `أضف إلى السلة`, `انتقل إلى الدفع` | `أضف في السلة` |
| containment/location/search scope | `في` | `ابحث في المطاعم`, `في قائمة الانتظار` | `على المطاعم` |
| details/features/platforms | `على` | `اطّلع على التفاصيل`, `متاح على iOS` | `في التفاصيل` |
| reporting/aboutness | `عن` | `أبلِغ عن محتوى`, `بحث عن` | `أبلِغ على` |
| purpose/cause | `لـ` / `بسبب` | `سجّل للاستفادة`, `محظور بسبب العمر` | `من أجل` when `لـ` works |
| immediate sequence/result | `فـ` | `أكّد طلبك فيصلك خلال 30 دقيقة` | `ثم` for immediate result |
| delayed sequence | `ثم` | `أضف للسلة ثم ادفع لاحقًا` | `فـ` for delayed steps |
| limit/end | `حتى` | `انتظر حتى يكتمل`, `حتى 50% خصم` | awkward `إلى أن` in short UI copy |
| choice | `أو` | `البريد أو الجوال` when one is enough | `و` if both are not required |
| yes/no question | `هل` | `هل تريد المتابعة؟` | `هل تعلم أن...` if not asking |
| choose between two in a question | `أم` | `هل تريد الحفظ أم التجاهل؟` | `أم` in ordinary button copy |
| exception/remaining | `إلا` / `سوى` | `لم يبقَ إلا خطوة` | wordy “one step remaining” when tighter fits |
| possibility | `قد` | `قد يستغرق دقائق` | certain future when uncertain |
| contrast | `لكن` | `حسابك مفعّل، لكن بعض الميزات محدودة` | disconnected clauses |

## Terminology

- Pick one term per concept and reuse it. Preserve existing product terminology unless wrong or unclear.
- Common defaults: sign in `تسجيل الدخول`, sign up `إنشاء حساب` or `التسجيل`, log out `تسجيل الخروج`, cart `السلة`, checkout `إتمام الطلب` or `الدفع`, subscription `الاشتراك`, tier/plan `الباقة`, settings `الإعدادات`, notifications `الإشعارات`, privacy `الخصوصية`, continue `متابعة`/`تابع`, try again `حاول مرة أخرى`.

## Output

- For creation: give the recommended copy first, then alternatives only if useful.
- For review/audit: `Original`, `Better`, `Issue`, `Why`. Group repeated issues once and reference the pattern.
- Before finalizing, verify: immediate user value, short wording, natural Arabic, clear next step, consistent gender/system voice, preserved tokens, correct plural/RTL/number/currency conventions, and no anti-pattern above.
