<?php

namespace Database\Seeders;

use App\Models\Banner;
use App\Models\Course;
use App\Models\Image;
use App\Models\TeamMember;
use App\Models\Trip;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class ProductionSeeder extends Seeder
{
    public function run(): void
    {
        // Create admin user
        User::firstOrCreate(
            ['email' => 'admin@oshys.com'],
            [
                'name' => 'Admin',
                'password' => Hash::make('password'),
            ]
        );

        $this->seedTrips();
        $this->seedCourses();
        $this->seedBanners();
        $this->seedTeamMembers();
    }

    private function seedTrips(): void
    {
        $trips = [
            [
                'name' => 'Diving Specialties',
                'slug' => 'diving-specialties',
                'description' => '<p>We would like to take you on a wonderful journey from the shore to the world of professional diving. We teach all the following specialties listed below. Our schedule is flexible and can fit your busy schedule.</p>

<p>Let us know what sparks your passion... Dream bigger, the oceans are vast and we have barely seen a fraction of them.</p>

<p><strong>Specialties we offer:</strong></p>
<ul>
<li>Navigation — Learn how to use magnetic and digital compasses to navigate your way in the sea</li>
<li>Search and Recovery — How to search for something lost and if it\'s heavy, how to lift it</li>
<li>Night Diving</li>
<li>Underwater Photography</li>
<li>Computer Diving</li>
<li>Boat Diving</li>
<li>Ecology Package</li>
<li>And more</li>
</ul>

<p>Our courses are ongoing and conducted by professional, fun-loving instructors who can accommodate your schedule. The course location depends on the specialty you\'re interested in — for example, we like to do navigation in Half Moon Bay because the limited visibility increases the challenge and fun.</p>

<p>Contact us for fees and scheduling. There are special offers for signing up for more than one specialty.</p>',
                'image' => 'trips/diving-specialties.jpg',
                'price' => 1400.00,
                'is_active' => true,
                'is_featured' => true,
                'translations' => [
                    'name' => ['ar' => 'تخصصات الغوص'],
                    'description' => ['ar' => '<p>نود أن نأخذك في رحلة رائعة من الشاطئ وصولاً إلى عالم الغوص الاحترافي. نقوم بتدريس جميع التخصصات التالية المذكورة أدناه. جدولنا مرن ويمكن أن يلائم جدولك المزدحم.</p>

<p>دعنا نعرف ما الذي يحمل شغفك... أحلم أكبر، المحيطات شاسعة وبالكاد رأينا جزءًا منها.</p>

<p><strong>التخصصات التي نقدمها:</strong></p>
<ul>
<li>الأبحار — تعرف على كيفية استخدام البوصلة المغناطيسية والرقمية للتنقل في طريقك في البحر</li>
<li>البحث والانتشال — كيف تبحث عن شيء مفقود وإذا كان ثقيلًا فكيف ترفعه؟</li>
<li>الغوص الليلي</li>
<li>التصوير تحت الماء</li>
<li>الغوص بالكمبيوتر</li>
<li>الغوص من قارب</li>
<li>الحزمة البيئية</li>
<li>و غيرها</li>
</ul>

<p>دوراتنا مستمرة ويتم تنفيذها من قبل مدربين محترفين ومحبين للمرح يمكنهم استيعاب جدولك الزمني. يعتمد موقع الدورة على التخصص الذي تهتم به، على سبيل المثال نود القيام بالملاحة في خليج نصف القمر لأن الرؤية محدودة مما يزيد من التحديات و المتعة.</p>

<p>تواصل معنا للرسوم و الجدولة. هناك عروض خاصة للتسجيل لأكثر من تخصص.</p>'],
                ],
            ],
            [
                'name' => 'Jubail Diving Experience (Boat Trip)',
                'slug' => 'jubail-diving-experience-boat-trip',
                'description' => '<p>Do you love exploring? Are you an adventurous person? Would you like to give a dear friend a unique gift?</p>

<p>How about celebrating with friends in a different way — a birthday party, a graduation party, or simply spending a day at sea with a diving experience.</p>

<p>A boat trip experience that takes you to a different world. It is your gateway to magical seas and a fascinating underwater realm.</p>

<p><strong>What to expect:</strong></p>
<ul>
<li>This amazing experience requires 2-3 hours at the center a few days before the trip</li>
<li>One of our fun instructors will review some information about diving and being in the water</li>
<li>The instructor will then teach you some skills in our pool</li>
<li>On trip day, we meet at Al-Fanateer Marina in Jubail at 6:45 AM</li>
<li>We board the boat and head out on a wonderful adventure — a day of sea and sun</li>
<li>Instructors will take you in pairs for an exciting underwater tour</li>
<li>We\'ll capture those shots for your Instagram</li>
<li>We usually return by 2:00 PM</li>
</ul>

<p>We bring snacks, water, and juices, but we ask you to bring a water bottle to refill during the trip as we don\'t use plastic.</p>

<p>Want to spend a special day with a loved one? Take the experience together!</p>

<p><strong>Group size:</strong> Minimum 5, Maximum 8</p>

<p>If you don\'t have the numbers, don\'t worry — contact us. We\'ll make sure you have a great time.</p>

<p><strong>Please contact us before payment.</strong></p>',
                'image' => 'trips/jubail-diving-experience-boat-trip.jpg',
                'price' => 800.00,
                'is_active' => true,
                'is_featured' => true,
                'translations' => [
                    'name' => ['ar' => 'تجربة الغوص من الجبيل (رحلة قارب)'],
                    'description' => ['ar' => '<p>هل تحب الاستكشاف؟ هل أنت شخص مغامر؟ هل ترغب في منح صديق عزيز هدية مختلفة.</p>

<p>ماذا عن الاحتفال مع الأصدقاء بطريقة مختلفة. حفلة عيد ميلاد أو حفلة تخرج أو مجرد قضاء يوم في البحر مع تجربة الغوص.</p>

<p>تجربة رحلة بحرية تأخذك إلى عالم مختلف. إنها بوابتك إلى البحار السحرية وعالم رائع.</p>

<p><strong>ماذا تتوقع:</strong></p>
<ul>
<li>تتطلب هذه التجربة الرائعة 2-3 ساعات في المركز قبل أيام قليلة من الرحلة</li>
<li>سيراجع أحد المدربين الممتعين لدينا بعض المعلومات حول الغوص والتواجد في الماء</li>
<li>ثم سيعلمك المدرب بعض المهارات في مسبحنا</li>
<li>في يوم الرحلة، نلتقي في مرسى الفناتير بالجبيل الساعة 6:45 صباحًا</li>
<li>نركب القارب وننطلق في مغامرة لطيفة — يوم البحر والشمس</li>
<li>سيأخذونكم المدربون في أزواج للقيام بجولة مثيرة تحت الماء</li>
<li>سوف نحصل لك على هذه اللقطات لحسابك في الانستغرام</li>
<li>في العادة، نعود الساعة 2:00 مساءً</li>
</ul>

<p>سنقوم بإحضار وجبات خفيفة ومياه وعصائر، لكننا نطلب منك إحضار زجاجة ماء لملئها أثناء الرحلة لأننا لا نستخدم البلاستيك.</p>

<p>تريد ان تقضي يوم خاص مع شخص عزيز؟ خوضوا التجربة معاً!</p>

<p><strong>العدد:</strong> الحد الأدنى 5 — العدد الأقصى 8</p>

<p>إذا لم يكن لديك أرقام، فلا داعي للقلق، اتصل بنا. سنجعلك تستمتع.</p>

<p><strong>الرجاء التواصل قبل الدفع.</strong></p>'],
                ],
            ],
            [
                'name' => 'Eid Celebration Diving Trip — Jubail',
                'slug' => 'eid-celebration-diving-trip-jubail',
                'description' => '<p>This is an exceptional trip aboard the prestigious Sea Eagle boat.</p>

<p>Join us on this special day as the boat departs Friday morning at 7:30 AM and returns in the evening, filled with a day of activities and events. This day is for everyone — divers, swimmers, or anyone who wants to spend a beautiful day with friends. Welcome!</p>

<p><strong>About the Jubail Islands:</strong></p>
<ul>
<li>The islands of Jubail, including Jana and Juraid, are among the most beautiful islands in the Arabian Gulf for diving</li>
<li>The coral reefs are surrounded by an aura of admiration and are the center of many research studies</li>
<li>They have an amazing ability to live and reproduce despite difficult environmental conditions — high salinity and extreme temperature variations between summer and winter</li>
<li>The environment is rich with fish and dolphins — and if you\'re lucky, you might encounter sea turtles or stingrays</li>
</ul>

<p>Our Jubail trips are full of fun and are for everyone — even if you\'re not a diver, you can join as a boat trip for swimming and relaxation.</p>

<p><strong>For divers:</strong> Want to gain new skills or develop your existing ones? Want to specialize in deep diving? Want to achieve perfect buoyancy? Want to learn the basics of underwater photography?</p>

<p>Sign up for one of the specialties on our trips and get a special discount.</p>

<p><strong>Price includes two air tanks and weights.</strong></p>',
                'image' => 'trips/eid-celebration-diving-trip-jubail.jpg',
                'price' => 450.00,
                'is_active' => true,
                'is_featured' => true,
                'translations' => [
                    'name' => ['ar' => 'رحلة غوص احتفالاً بالعيد للجبيل – يشمل السعر اسطوانتين هواء و الاوزان'],
                    'description' => ['ar' => '<p>هذه رحلة استثنائية على متن القارب العريق نسر البحر.</p>

<p>شاركونا هذا اليوم المميز حيث ينطلق القارب صبح يوم الجمعة الساعة 7:30 و يعود مساءً و يتخلله يوم مليء بالفعاليات و الأنشطة. هذا اليوم للجميع، غواص، سباح، أو متنزه يريد أن يقضي يوم جميل مع الأصحاب... حياكم.</p>

<p><strong>عن جزر الجبيل:</strong></p>
<ul>
<li>تعد جزر الجبيل و منها جنى و جريد من أجمل جزر الخليج العربي للغوص</li>
<li>تحيط الشعب المرجانية هالة من الإعجاب و هي مركز عدة بحوث</li>
<li>لقدرتها العجيبة على الحياة و التكاثر رغم الظروف البيئية الصعبة المحيطة بها من شدة الملوحة و التفاوت الكبير بين درجات الحرارة بين فصلي الصيف و الشتاء</li>
<li>تعتبر هذه البيئة غنية بالأسماك و الدلافين — وإذا حالفك الحظ قد تصادف السلاحف أو أسماك الستينق ري</li>
</ul>

<p>رحلاتنا للجبيل يملؤها المرح و هي للجميع حتى إذا لم تكن غواصاً بإمكانك المشاركة كرحلة بحرية للسباحة و الاستجمام.</p>

<p><strong>للغواصين:</strong> هل تريد أن تكسب مهارات جديدة أو تطور مهاراتك؟ هل تريد أن تتخصص في غوص الأعماق؟ هل ترغب بأن تصل للطفوية المثالية؟ هل ترغب أن تتعلم أساسيات التصوير تحت الماء؟</p>

<p>سجل معنا إحدى التخصصات في إحدى رحلاتنا و احصل على خصم خاص على التخصص.</p>

<p><strong>يشمل السعر اسطوانتين هواء و الأوزان.</strong></p>'],
                ],
            ],
            [
                'name' => 'Discover Diving from Shore',
                'slug' => 'discover-diving-from-shore',
                'description' => '<p>If you love exploring and adventure and are looking for a unique gift for someone dear to you, then sea diving trips are the perfect choice!</p>

<p>The diving experience will take you to a different world — it will be your gateway to enchanting seas and a stunning underwater realm.</p>

<p><strong>Features of our shore diving trips:</strong></p>
<ul>
<li>The experience starts with registration and learning about diving techniques at the dive center</li>
<li>A diving permit is obtained from the border guard at Half Moon Beach before heading to the shore for a wonderful time diving</li>
<li>Diving trips are available for individuals, couples, and families — you can spend a special day with a loved one and enjoy the experience together</li>
<li>The diving experience allows you to access a new marine environment and see amazing and exotic marine life you\'ve never seen before</li>
</ul>

<p>There is nothing like the experience of diving in the sea — it gives you the opportunity to explore a mysterious environment and see incredible marine creatures.</p>

<p>It\'s the perfect choice as a unique gift for someone dear to you, and it lets you embark on an amazing new experience. Don\'t hesitate to join a sea diving trip with Corals & Shells.</p>

<p><strong>Register now!</strong></p>',
                'image' => 'trips/discover-diving-from-shore.jpg',
                'price' => 450.00,
                'is_active' => true,
                'is_featured' => true,
                'translations' => [
                    'name' => ['ar' => 'اكتشاف الغوص من شاطئ'],
                    'description' => ['ar' => '<p>إذا كنت تحب الاستكشاف والمغامرة وتبحث عن هدية مميزة لشخص عزيز عليك، فإن رحلات الغوص في البحر هي الخيار الأمثل لك!</p>

<p>ستأخذك تجربة الغوص إلى عالم مختلف، وستكون مدخلك إلى بحور ساحرة وعالم خلاب.</p>

<p><strong>مميزات رحلات الغوص الحر:</strong></p>
<ul>
<li>تجربة الغوص تبدأ بالتسجيل وبعض المعلومات حول الغوص وطرقه في مركز الغوص</li>
<li>يتم الحصول على تصريح الغوص من حرس الحدود في شاطئ نصف القمر، قبل الاتجاه إلى الشاطئ لتمضية وقت ممتع في الغوص</li>
<li>تتوفر رحلات الغوص للأفراد والأزواج والعائلات، ويمكنك قضاء يوم خاص مع شخص عزيز والاستمتاع بالتجربة سوياً</li>
<li>تجربة الغوص تتيح لك الوصول إلى بيئة بحرية جديدة ومشاهدة الأحياء البحرية المذهلة والغريبة التي لم ترها من قبل</li>
</ul>

<p>لا يوجد شيء مثل تجربة الغوص في البحر، فهي تتيح لك فرصة استكشاف بيئة غامضة ومشاهدة مخلوقات بحرية مدهشة.</p>

<p>إنه الاختيار المثالي كهدية فريدة لشخص عزيز عليك ويجعلك تخوض تجربة جديدة مذهلة، فلا تتردد في الانضمام إلى رحلة الغوص في البحر من مرجان وصدف.</p>

<p><strong>سجل الآن!</strong></p>'],
                ],
            ],
            [
                'name' => 'Half Moon Bay Diving Trip (For Divers)',
                'slug' => 'half-moon-bay-diving-trip',
                'description' => '<p>Half Moon Beach is the go-to destination for divers in the Eastern Province. As we always say — if you master your buoyancy at Half Moon, you can dive anywhere with skill.</p>

<p>Visibility is limited? Excellent! Show us your skills using the compass.</p>

<p><strong>Half Moon Beach is ideal for:</strong></p>
<ul>
<li>Training on diving fundamentals</li>
<li>Advanced specialties such as perfect buoyancy</li>
<li>Compass navigation</li>
<li>Search and recovery</li>
<li>Rescue courses</li>
</ul>

<p>The Eastern Province instructors have worked hard to enrich the area by building and placing artificial structures. These structures have played a magical role in attracting fish and providing a fertile environment for reproduction.</p>

<p><strong>Did you know?</strong> The rare Angelfish is found in abundance in the Half Moon area.</p>

<p>Want to gain new skills or develop your existing ones? Or simply break the routine and spend a beautiful day on the beach?</p>

<p><strong>The fee covers one air tank, weights, and refreshments.</strong></p>',
                'image' => 'trips/half-moon-bay-diving-trip.jpg',
                'price' => 130.00,
                'is_active' => true,
                'is_featured' => true,
                'translations' => [
                    'name' => ['ar' => 'رحلة غوص شاطئ نصف القمر (للغواصين)'],
                    'description' => ['ar' => '<p>يعد شاطئ نصف القمر وجهة غواصي المنطقة الشرقية و كما دائماً نقول إذا ضبطت طفويتك في الهالفمون تقدر تغوص في أي مكان بحرفنة.</p>

<p>الرؤية مو لهناك؟ ممتاز!! ورّينا شطارتك باستخدام البوصلة.</p>

<p><strong>شاطئ نصف القمر مكان مثالي للتدريب على:</strong></p>
<ul>
<li>أساسيات الغوص</li>
<li>تخصصات متقدمة مثل الطفوية المثالية</li>
<li>استخدام البوصلة</li>
<li>البحث والانتشال</li>
<li>دورات الإنقاذ</li>
</ul>

<p>لقد عمل مدربي الشرقية بجهد لإغناء المنطقة فقاموا ببناء و وضع مجسمات اصطناعية. قامت هذه المجسمات بدور ساحر لجذب الأسماك و تأمين بيئة خصبة للتكاثر.</p>

<p><strong>هل تعلم؟</strong> أن سمكة الملاك النادرة تتواجد بكثرة في منطقة نصف القمر.</p>

<p>هل تريد أن تكتسب مهارات جديدة أو تطور مهاراتك؟ أو ببساطة القضاء على الروتين و قضاء يوم جميل على الشاطئ.</p>

<p><strong>تغطي الرسوم اسطوانة هواء و الأوزان و المرطبات.</strong></p>'],
                ],
            ],
        ];

        foreach ($trips as $tripData) {
            $translations = $tripData['translations'] ?? [];
            unset($tripData['translations']);

            $trip = Trip::firstOrCreate(
                ['slug' => $tripData['slug']],
                $tripData
            );

            // Create image record if the file exists in storage
            if ($trip->image && !$trip->images()->where('path', $trip->image)->exists()) {
                $trip->images()->create([
                    'filename' => basename($trip->image),
                    'path' => $trip->image,
                    'url' => '/storage/' . $trip->image,
                    'mime_type' => 'image/jpeg',
                    'size' => file_exists(storage_path('app/public/' . $trip->image))
                        ? filesize(storage_path('app/public/' . $trip->image))
                        : 0,
                    'collection' => 'main',
                    'order' => 0,
                ]);
            }

            if (!empty($translations)) {
                $trip->saveTranslations($translations);
            }
        }
    }

    private function seedCourses(): void
    {
        $courses = [
            [
                'name' => 'Professional Dive Leader & Guide Course',
                'slug' => 'professional-dive-leader-guide',
                'description' => '<p>Are you ready to take your diving to the next level? Are you ready to join the world of professional diving and turn your hobby into a career? You don\'t have to leave your day job — but do you want to earn a little more and enjoy doing it?</p>

<p>To book a dive course, we would like to sit down and discuss this big step with you.</p>

<p><strong>Requirements:</strong></p>
<ol>
<li>60 dives by the end of your course</li>
<li>Review all open water student skills (pool)</li>
<li>Participate in at least two open water courses</li>
<li>Organize a full trip to Jubail and perform the dive briefing and guide the group underwater</li>
<li>Pass injured diver rescue exercises</li>
<li>Pass the endurance test</li>
<li>Participate in dive site mapping and evacuation planning</li>
<li>Pass the Dive Science and Dive Guide online exam — lecture dates will be scheduled</li>
<li>Participate in the center\'s daily routine: marketing, registration, and student interaction</li>
<li>Participate in dive guide workshops</li>
</ol>

<p>Please make yourself available as much as possible for two months to become a diving expert.</p>

<p>Dive guides are required to have their own full equipment.</p>

<p><strong>Installment plans available for the professional program.</strong></p>',
                'image' => 'courses/professional-dive-leader-guide.jpg',
                'price' => 5000.00,
                'level' => 'Advanced',
                'category' => 'Leadership',
                'is_active' => true,
                'is_featured' => true,
                'has_certificate' => true,
                'translations' => [
                    'name' => ['ar' => 'دورات احترافية — قائد و مرشد غوص'],
                    'description' => ['ar' => '<p>هل أنت مستعد لخطوة تعلم الغوص؟ هل أنت مستعد للانضمام إلى عالم الغوص المحترف وجعل مهنة من هوايتك؟ لست مضطرًا لترك وظيفتك اليومية ولكن هل تريد أن تكسب أكثر قليلاً وأن تستمتع بالقيام بذلك؟</p>

<p>لحجز دورة الغوص نود أن نجلس ونناقش هذه الخطوة الكبيرة معك.</p>

<p><strong>المتطلبات:</strong></p>
<ol>
<li>60 غطسة بنهاية دورتك</li>
<li>مراجعة جميع مهارات طلاب المياه المفتوحة (مسبح)</li>
<li>المشاركة في دورتين مياه مفتوحة على الأقل</li>
<li>تنظيم رحلة كاملة إلى الجبيل وأداء ملخص الغوص وتوجيه المجموعة تحت الماء</li>
<li>اجتياز تمارين إنقاذ غواص مصاب</li>
<li>اجتياز اختبار القدرة على التحمل</li>
<li>المشاركة في رسم خرائط موقع الغوص وخطة الإخلاء</li>
<li>اجتياز اختبار دليل علوم الغوص وإرشاد الغوص عبر الإنترنت — سيتم تحديد مواعيد المحاضرات</li>
<li>المشاركة في الروتين اليومي للمركز والتسويق والتسجيل والتفاعل مع الطلاب</li>
<li>المشاركة في ورش العمل لمرشدي الغوص</li>
</ol>

<p>يرجى جعل نفسك متاحًا قدر الإمكان لمدة شهرين لتكون خبيرًا في الغوص.</p>

<p>مطلوب من مرشدي الغوص أن يكون لديهم معداتهم الكاملة.</p>

<p><strong>برنامج الاحتراف متاح بالأقساط.</strong></p>'],
                ],
            ],
            [
                'name' => 'Dive Science Course',
                'slug' => 'dive-science-course',
                'description' => '<p>If you want to explore the fascinating world of seas and oceans and enjoy a safe and fun diving experience, this diving course is the essential step to achieve that.</p>

<p>The course allows you to learn all aspects of diving, from the basics to advanced techniques, and helps you understand the factors affecting the human body underwater.</p>

<p><strong>What you will learn:</strong></p>
<ul>
<li>Dive Science specialty from SSI — a fundamental way to expand your diving knowledge</li>
<li>Achieve Dive Guide certification level</li>
<li>Complete the course easily by obtaining certification online</li>
<li>Rich, specialized content covering everything you need for safe and proper diving</li>
</ul>

<p>This course is beneficial for most professional SSI diving programs and extended range, helping you develop a complete understanding of the underwater world and its effects on the human body.</p>

<p>Once completed, you\'ll be able to start your diving career with confidence and skill, moving closer to achieving Dive Guide accreditation.</p>

<p><strong>Book your Dive Science course now and get ready for an unforgettable underwater experience.</strong></p>',
                'image' => 'courses/dive-science-course.jpg',
                'price' => 1200.00,
                'level' => 'Advanced',
                'category' => 'Develop Your Diving',
                'is_active' => true,
                'is_featured' => true,
                'has_certificate' => true,
                'translations' => [
                    'name' => ['ar' => 'دورة علوم الغوص'],
                    'description' => ['ar' => '<p>إذا كنت ترغب في استكشاف عالم البحار والمحيطات الساحر والحصول على تجربة غوص ممتع وآمن، فإن دورة تعليم الغوص هذه هي الخطوة الأساسية لتحقيق ذلك.</p>

<p>تتيح لك الدورة التعرّف على كل جوانب الغوص، من الأساسيات إلى التقنيات المتقدمة، وتساعدك على فهم العوامل المؤثرة على جسم الإنسان تحت الماء.</p>

<p><strong>ماذا ستتعلم:</strong></p>
<ul>
<li>تخصص علوم الغوص من SSI — طريقة أساسية لتوسيع معرفتك بالغوص</li>
<li>تحقيق تصنيف مرشد الغوص</li>
<li>إكمال الدورة بسهولة والحصول على الشهادة عبر الإنترنت</li>
<li>محتوى غني ومتخصص يشمل كل ما تحتاجه لتعلم الغوص بطريقة صحيحة وآمنة</li>
</ul>

<p>تعتبر هذه الدورة مفيدة لمعظم برامج الغوص الاحترافية في SSI والنطاق الممتد، وتساعدك على تطوير فهم كامل للعالم تحت الماء وتأثيراته على جسم الإنسان.</p>

<p>بمجرد الانتهاء من الدورة، ستتمكن من الشروع في حياتك المهنية في الغوص بثقة ومهارة، وستقترب من تحقيق الاعتماد كمرشد غوص.</p>

<p><strong>احجز الآن دورتك في علوم الغوص واستعد لتجربة مميزة تحت الماء.</strong></p>'],
                ],
            ],
            [
                'name' => 'Master Diver Package',
                'slug' => 'master-diver-package',
                'description' => '<p>The Master Diver Package is a comprehensive program that takes you from beginner to master diver level.</p>

<p><strong>The package includes:</strong></p>
<ol>
<li>Foundation diving course (Open Water)</li>
<li>Advanced diving course consisting of 4 specialties:
<ul>
<li>Deep diving specialty</li>
<li>First aid specialty — CPR, oxygen provider, and AED</li>
<li>Two additional specialties of your choice: compass navigation, night diving, buoyancy, nitrox, search and recovery, underwater photography, etc.</li>
</ul>
</li>
<li>Stress and Rescue course</li>
<li>To reach Master Diver level — the diver must complete 50 dives</li>
</ol>

<p><strong>Package includes:</strong></p>
<ul>
<li>All training materials</li>
<li>Pool and sea training fees</li>
<li>Equipment rental during courses</li>
<li>Two trips to Jubail</li>
<li>6-month center membership to help divers reach 50 dives</li>
</ul>',
                'image' => 'courses/master-diver-package-1.jpg',
                'price' => 7000.00,
                'level' => 'All Levels',
                'category' => 'Leadership',
                'is_active' => true,
                'is_featured' => true,
                'has_certificate' => true,
                'translations' => [
                    'name' => ['ar' => 'باقة كبير الغواصين'],
                    'description' => ['ar' => '<p>باقة كبير الغواصين عبارة عن برنامج شامل يأخذك من المستوى المبتدئ إلى مستوى كبير الغواصين.</p>

<p><strong>تتكون الباقة من:</strong></p>
<ol>
<li>دورة الغوص التأسيسية</li>
<li>دورة الغوص المتقدمة وتتكون من 4 تخصصات:
<ul>
<li>تخصص العميق</li>
<li>تخصص الإسعافات الأولية — الإنعاش القلبي ومزود الأوكسجين وجهاز الصدمات</li>
<li>تخصصين إضافيين من اختيارك: غوص البوصلة، الليل، الطفوية، النيتروكس، البحث والانتشال، التصوير تحت الماء... إلخ</li>
</ul>
</li>
<li>دورة الجهد والإنقاذ</li>
<li>للوصول لمستوى كبير الغواصين — يجب أن يحصل الغواص على 50 غوصة</li>
</ol>

<p><strong>الباقة تشمل:</strong></p>
<ul>
<li>جميع المواد التعليمية</li>
<li>رسوم تدريب المسابح والبحر</li>
<li>استئجار المعدات خلال الدورات</li>
<li>رحلتين إلى الجبيل</li>
<li>عضوية المركز لمدة 6 أشهر لمساعدة الغواصين الوصول لـ 50 غوصة</li>
</ul>'],
                ],
            ],
            [
                'name' => 'Pool & Beach Lifeguard Course',
                'slug' => 'pool-beach-lifeguard-course',
                'description' => '<p>With the growing number of clubs and resorts, lifeguard job opportunities are on the rise. Our distinguished course follows the American Lifeguard program.</p>

<p>In the Pool & Beach Lifeguard course, participants learn the proper methods for first aid, rescue, and evacuation of drowning victims from the bottom and surface of the water.</p>

<p><strong>The course consists of:</strong></p>
<ol>
<li>First Aid and CPR course — 1 day</li>
<li>Rescue course from the American Pool Lifeguard organization:
<ul>
<li>Theory</li>
<li>Pool rescue training — 2-3 days</li>
<li>Sea rescue training — 1 day</li>
</ul>
</li>
</ol>

<p><strong>Participants receive an international license and certificate after passing the course requirements.</strong></p>',
                'image' => 'courses/pool-beach-lifeguard-course.jpg',
                'price' => 2400.00,
                'level' => 'All Levels',
                'category' => 'Swim Programs',
                'is_active' => true,
                'is_featured' => true,
                'has_certificate' => true,
                'translations' => [
                    'name' => ['ar' => 'دورة منقذ مسابح وشواطئ'],
                    'description' => ['ar' => '<p>تزايد مؤخراً عدد الأندية والمنتجعات ومعها أتت فرص للعمل كمنقذ. دورتنا المميزة تتبع المنظمة الأمريكية برنامج اللايف قارد.</p>

<p>دورة إنقاذ المسابح والشواطئ يتعلم فيها المشترك الطرق الصحيحة لإسعاف وإنقاذ وإخلاء الغرقى من قاع وسطح الماء.</p>

<p><strong>تتكون الدورة من:</strong></p>
<ol>
<li>دورة إسعافات أولية وإنعاش — يوم واحد</li>
<li>دورة الإنقاذ من المنظمة الأمريكية لمنقذي المسابح:
<ul>
<li>نظري</li>
<li>تدريبات مسبح (إنقاذ مسابح) — 2-3 أيام</li>
<li>تدريب إنقاذ بحر — يوم واحد</li>
</ul>
</li>
</ol>

<p><strong>يحصل المشترك على رخصة وشهادة دولية بعد اجتياز متطلبات الدورة.</strong></p>'],
                ],
            ],
            [
                'name' => 'Adventure Diver Course',
                'slug' => 'adventure-diver-course',
                'description' => '<p>The Adventure Diver course is the next stage after the foundation course. This course differs by focusing on advanced diving skills. It does not include pool training — instead, it gives the diver the opportunity to experience five dives across five different specialties.</p>

<p><strong>Specialties include:</strong></p>
<ul>
<li>Navigation — using the compass</li>
<li>Perfect Buoyancy</li>
<li>Search and Recovery</li>
<li>And more</li>
</ul>

<p>In this course, the diver discovers their diving interests and can later branch out and specialize in a particular skill through specialty courses such as the Perfect Buoyancy specialty or the Deep Diving course.</p>

<p>This course stands out because with every dive, the diver learns a new skill.</p>

<p>A trip to one of Jubail\'s beautiful islands can be added for an extra fee to experience boat diving and deep diving.</p>',
                'image' => 'courses/adventure-diver-1.jpg',
                'price' => 2000.00,
                'level' => 'Beginner',
                'category' => 'Develop Your Diving',
                'is_active' => true,
                'is_featured' => true,
                'has_certificate' => true,
                'translations' => [
                    'name' => ['ar' => 'دورة غواص المغامرات'],
                    'description' => ['ar' => '<p>دورة غواص المغامرات هو المرحلة التالية بعد الدورة التأسيسية. تختلف هذي الدورة بكونها تتركز حول مهارات الغوص المتقدمة. لا تحتوي على تدريب مسبح بل تمنح الغواص الفرصة لتجربة خمسة غوصات من خمس تخصصات مختلفة.</p>

<p><strong>التخصصات تشمل:</strong></p>
<ul>
<li>الأبحار — استخدام البوصلة</li>
<li>الطفوية المثالية</li>
<li>البحث والانتشال</li>
<li>و غيرها</li>
</ul>

<p>في هذه الدورة يكتشف الغواص اهتماماته في الغوص وبالأمكان التشعب والتخصص فيما بعد في مهارة معينة بحد ذاتها من خلال الدورات التخصصية مثل دورة الطفوية المثالية أو دورة الغوص العميق.</p>

<p>تمتاز هذه الدورة بأن كل غوصة يتعلم الغواص مهارة جديدة.</p>

<p>بالأمكان اضافة رحلة الى احدى جزر الجبيل الجميلة برسوم اضافية لتجربة الغوص من قارب والغوص العميق.</p>'],
                ],
            ],
            [
                'name' => 'Perfect Buoyancy Specialty',
                'slug' => 'perfect-buoyancy-specialty',
                'description' => '<p>Are you looking for the best diving experience? We offer you a course that gives you the ideal diving experience you\'ve been dreaming of. In this course, you\'ll learn everything needed to experience diving with complete freedom and enjoy the water with total ease.</p>

<p>Let us take you on an unparalleled journey into the amazing world of the seas!</p>

<p><strong>Course features:</strong></p>
<ul>
<li>Learn everything about buoyancy control and experience diving with total freedom</li>
<li>The course includes theoretical sessions and practical training for the best experience</li>
<li>Learn perfect buoyancy and improve your diving skills</li>
<li>Perfect buoyancy will enable you to enjoy the water comfortably and move without any obstacles</li>
<li>You\'ll spend more time underwater and enjoy marine life better</li>
<li>You\'ll reduce your air consumption, extending your dive time</li>
<li>Get the opportunity for underwater photography and win diving photography competitions</li>
</ul>

<p>There is nothing more exciting and adventurous than perfecting your buoyancy! Book your course now and join this unique experience today.</p>',
                'image' => 'courses/perfect-buoyancy-specialty.jpg',
                'price' => 1200.00,
                'level' => 'Intermediate',
                'category' => 'Develop Your Diving',
                'is_active' => true,
                'is_featured' => true,
                'has_certificate' => true,
                'translations' => [
                    'name' => ['ar' => 'دورة تخصص الطفوية المثالية'],
                    'description' => ['ar' => '<p>هل تبحث عن تجربة الغوص الأفضل؟ نقدم لك دورة غوص تمنحك تجربة الغوص المثالية التي تحلم بها. في هذه الدورة، ستتعلم كل ما يلزم لتجربة الغوص بالحرية التامة والاستمتاع بالماء بكل سهولة.</p>

<p>دعنا نأخذك في رحلة لا مثيل لها إلى عالم البحار المدهش!</p>

<p><strong>مميزات الدورة:</strong></p>
<ul>
<li>تعلم كل ما يتعلق بالغوص الحر وتجربة الغوص بالحرية التامة</li>
<li>تحتوي الدورة على جلسات نظرية وتدريبات عملية للحصول على أفضل تجربة</li>
<li>تعلم كيفية الطفو المثالي وتحسين مهارات الغوص الخاصة بك</li>
<li>تجربة الغوص الحر ستمكنك من الاستمتاع بالماء بكل راحة وسهولة وتمنحك مهارة التحرك دون أي عوائق</li>
<li>ستحظى بوقت أطول تحت الماء وستتمكن من الاستمتاع بالحياة البحرية بشكل أفضل</li>
<li>ستقلل استهلاكك للهواء، مما يزيد من فترة غوصك</li>
<li>تحصل على فرصة التصوير تحت الماء والفوز بمسابقات التصوير الخاصة بالغوص</li>
</ul>

<p>لا يوجد شيء أكثر إثارة ومغامرة من تجربة الغوص الحر! احجز دورتك الآن وانضم إلى هذه التجربة الفريدة من نوعها اليوم.</p>'],
                ],
            ],
            [
                'name' => 'Coral Reef Ecology Course',
                'slug' => 'coral-reef-ecology-course',
                'description' => '<p>Humans once thought these stunning creatures were just colorful rocks — how wrong they were! Coral reefs are animals, and each coral, called a polyp, lives in its home called a corallite. Each polyp secretes and builds a limestone home over successive generations — this is what creates coral reefs.</p>

<p>Their presence in the seas is essential for the survival of marine life. Unfortunately, human expansion threatens their survival and consequently all our vast, enchanting oceans are at risk.</p>

<p>This environmental course is a theoretical course that will teach you a great deal whether you practice diving or are simply a nature lover. It can be combined with our other scientific environmental courses (five specialties) for an additional fee.</p>

<p>We are preparing environmental campaigns to change many misconceptions. Contact us for details.</p>

<p>Also check out our <strong>World of Sharks course</strong>.</p>',
                'image' => 'courses/coral-reef-1.jpg',
                'price' => 850.00,
                'level' => 'All Levels',
                'category' => 'Develop Your Diving',
                'is_active' => true,
                'is_featured' => true,
                'has_certificate' => true,
                'translations' => [
                    'name' => ['ar' => 'دورة الشعب المرجانية'],
                    'description' => ['ar' => '<p>اعتقد الأنسان مسبقاً أن هذه الكائنات الخلابة مجرد صخور ملونة، كم أخطئوا! الشعاب المرجانية حيوانات وكل شعاب مرجانية، تسمى سليلة، تعيش في منزلها وتسمى كوراليت. وكل زائدة تفرز وتبني منزلاً من الحجر الجيري على مدى الأجيال المتعاقبة، وهذا ما يصنع الشعاب المرجانية.</p>

<p>وجودها في البحار أساسي لبقاء الحياة البحرية وللأسف يهدد المد البشري بقائها وبالتالي جميع محيطاتنا الواسعة الساحرة في خطر.</p>

<p>هذه الدورة البيئية دورة نظرية ستعلمك الكثير سواء كنت من ممارسي رياضة الغوص أو ببساطة محب للطبيعة وبالأمكان جمعها مع دوراتنا البيئية العلمية الأخرى (خمس تخصصات) برسوم اضافية.</p>

<p>نستعد لحملات بيئية لتغيير الكثير من المفاهيم. تواصل معنا للتفاصيل.</p>

<p>إطلع أيضاً على <strong>دورة عالم القروش</strong>.</p>'],
                ],
            ],
            [
                'name' => 'Fish Identification Course',
                'slug' => 'fish-identification-course',
                'description' => '<p>The ocean is full of wonderful and beautiful fish of every shape and size. Learn how to identify fish and get more out of your dives with the SSI Fish Identification course.</p>

<p>This environmental course is a theoretical course that will teach you a great deal whether you practice diving or are simply a nature lover. It can be combined with our other scientific environmental courses for an additional fee.</p>

<p>Contact us for details.</p>',
                'image' => 'courses/fish-identification-1.jpg',
                'price' => 500.00,
                'level' => 'All Levels',
                'category' => 'Develop Your Diving',
                'is_active' => true,
                'is_featured' => true,
                'has_certificate' => true,
                'translations' => [
                    'name' => ['ar' => 'دورة التعرف على الاسماك'],
                    'description' => ['ar' => '<p>المحيط مليء بالأسماك الرائعة والجميلة من كل شكل وحجم. تعرف على كيفية التعرف على الأسماك والاستفادة بشكل أكبر من الغطس من خلال دورة التعرف على الأسماك SSI.</p>

<p>هذه الدورة البيئية دورة نظرية ستعلمك الكثير سواء كنت من ممارسي رياضة الغوص أو ببساطة محب للطبيعة وبالأمكان جمعها مع دوراتنا البيئية العلمية الأخرى برسوم اضافية.</p>

<p>تواصل معنا للتفاصيل.</p>'],
                ],
            ],
            [
                'name' => 'World of Sharks Course',
                'slug' => 'world-of-sharks-course',
                'description' => '<p>This special SSI course is all about this creature that has captivated human attention and become the subject of movies — but are those movies fair to it?</p>

<p>When many people hear the word "shark," they imagine a specific image and feel a deep, primal fear. Even though most people have never encountered a shark in their lives, the idea of being in the water with one triggers fears similar to those we have about spiders and snakes. We\'ve developed these instincts over thousands of years to protect ourselves from harm. Is this fear justified or rational? What is the basis of fear of sharks?</p>

<p><strong>In this course:</strong></p>
<ul>
<li>Summarize historical and cultural human perspectives regarding sharks</li>
<li>Identify the important role sharks play in the marine ecosystem</li>
<li>Is this fear justified or rational? What is the basis of fear of sharks?</li>
<li>Did you know that sharks are at risk of extinction — and with them, life in the ocean?</li>
</ul>

<p>Analyze with us the global investigation file into so-called shark attacks.</p>

<p><strong>If you are an environmental activist and want to join our environmental group and register for more than one course covering marine science and coral reefs, contact us for the special environmental package price (5 courses).</strong></p>',
                'image' => 'courses/world-of-sharks-1.png',
                'price' => 850.00,
                'level' => 'All Levels',
                'category' => 'Develop Your Diving',
                'is_active' => true,
                'is_featured' => true,
                'has_certificate' => true,
                'translations' => [
                    'name' => ['ar' => 'دورة عالم القروش'],
                    'description' => ['ar' => '<p>هذه الدورة الخاصة من اس اس اي تتعلق بهذا الكائن الذي خطف أنفاس البشر وأصبح موضوع الأفلام السينمائية ولكن هل هي منصفة بحقه؟</p>

<p>عندما يسمع الكثير من الناس عن مسمى سمكة القرش، فإنهم يتخيلون صورة محددة ويشعرون بالخوف بدائي عميق على الرغم من أن معظم الناس لم يواجهوا سمكة القرش أبداً خلال حياتهم. إلا أن فكرة وجودهم في الماء مع سمكة القرش تثير مخاوف مماثلة لتلك التي نحتفظ بها للعناكب والثعابين. لقد طورنا هذه الغرائز على مدى آلاف السنين لنحمي أنفسنا من الأذى. هل هذا الخوف مبرر أم عقلاني؟ ما هو أساس الخوف من أسماك القرش؟</p>

<p><strong>في هذه الدورة:</strong></p>
<ul>
<li>تلخيص وجهات النظر التاريخية والثقافية لدى البشر فيما يتعلق بأسماك القرش</li>
<li>التعرف على الدور الهام الذي تلعبه أسماك القرش في النظام البيئي البحري</li>
<li>هل هذا الخوف مبرر أم عقلاني؟ ما هو أساس الخوف من أسماك القرش؟</li>
<li>هل تعلم أن أسماك القرش معرضة للإنقراض ومعها الحياة في المحيط؟</li>
</ul>

<p>حلل معنا ملف التحقيق العالمي فيما يسمى هجمات القروش.</p>

<p><strong>إذا أنت ناشط بيئي ويهمك أن تشارك في مجموعتنا البيئية وتسجل في أكثر من دورة تتناول علوم البحار والشعب المرجانية، تواصل معنا لأسعار الحزمة البيئية الخاصة (5 دورات).</strong></p>'],
                ],
            ],
            [
                'name' => 'First Aid Course',
                'slug' => 'first-aid-course',
                'description' => '<p>Do you know how to act in emergencies and save the situation? Here is the First Aid course from Corals & Shells, which is the first step in training on essential first aid skills.</p>

<p><strong>Features:</strong></p>
<ul>
<li>This intensive course includes many essential skills for dealing with common emergencies, starting from basic first aid for surface wounds and progressing to CPR, as well as learning how to provide oxygen and use an AED (defibrillator)</li>
<li>The course aims to provide participants with the necessary knowledge and basic skills to deal with medical emergencies, and train them to take immediate action until they reach professional medical rescue level</li>
<li>The course grants first aid certificates for adults and children at the end of the training period</li>
</ul>

<p>Don\'t miss the opportunity — choose the First Aid course to learn how to act in emergencies. Book your seat now with Corals & Shells!</p>',
                'image' => 'courses/first-aid-1.jpg',
                'price' => 850.00,
                'level' => 'All Levels',
                'category' => 'Family and Youth',
                'is_active' => true,
                'is_featured' => true,
                'has_certificate' => true,
                'translations' => [
                    'name' => ['ar' => 'دورة اسعافات اولية'],
                    'description' => ['ar' => '<p>هل تعلم كيف تتصرف في حالات الطوارئ وتنقذ الموقف! إليك دورة الإسعافات الأولية من Corals & Shells، والتي تُعد الخطوة الأولى للتدريب على مهارات الإسعافات الأولية الأساسية.</p>

<p><strong>مميزاتها:</strong></p>
<ul>
<li>تتضمن هذه الدورة المكثفة العديد من المهارات الضرورية للتعامل مع الحالات الطارئة الشائعة، تبدأ من الإسعافات الأولية البسيطة للجروح السطحية وترتقي للإنعاش القلبي والرئوي بالإضافة إلى معرفة كيفية تزويد الأكسجين واستخدام جهاز الصدمات الكهربائية</li>
<li>تهدف الدورة إلى تزويد المشاركين بالمعرفة اللازمة والمهارات الأساسية للتعامل مع حالات الطوارئ الطبية، وتدريبهم على اتخاذ إجراءات فورية حتى يصلوا إلى مستوى الإسعاف الطبي المحترف</li>
<li>تمنح الدورة شهادات إسعافات أولية للكبار والأطفال في نهاية فترة التدريب</li>
</ul>

<p>لا تفوت الفرصة، واختر دورة الإسعافات الأولية لتتعلم كيف تتصرف في حالة الطوارئ. احجز مقعدك الآن مع Corals & Shells!</p>'],
                ],
            ],
            [
                'name' => 'Enriched Air Nitrox Course',
                'slug' => 'enriched-air-nitrox-course',
                'description' => '<p>In this program, you will learn new skills — namely why some organizations recommend replacing regular air with Nitrox, and how to analyze an air cylinder while learning how to plan and dive safely using an enriched air mix of up to 40% oxygen.</p>

<p><strong>Benefits:</strong></p>
<ul>
<li>As an enriched air diver, you can increase your dive times and safety margins</li>
<li>Shorten your surface intervals so you can spend more time diving and less time waiting</li>
<li>Better planning and safer diving</li>
</ul>

<p>The course is theoretical, but once you obtain your license, Nitrox cylinders can be provided for an additional fee.</p>',
                'image' => 'courses/nitrox-course-1.jpg',
                'price' => 850.00,
                'level' => 'Intermediate',
                'category' => 'Develop Your Diving',
                'is_active' => true,
                'is_featured' => true,
                'has_certificate' => true,
                'translations' => [
                    'name' => ['ar' => 'دورة الهواء المشبع بالاوكسجين (نيتروكس)'],
                    'description' => ['ar' => '<p>في هذا البرنامج ستتعلم مهارات جديدة ألا وهي لماذا تنصح بعض المنظمات باستبدال الهواء العادي بالنيتروكس وكيف تقوم بتحليل اسطوانة الهواء بينما تتعلم كيفية التخطيط والغوص بأمان باستخدام مزيج من الهواء المخصب يصل إلى أكسجين 40%.</p>

<p><strong>المميزات:</strong></p>
<ul>
<li>بصفتك غواص هواء مشبع، يمكنك زيادة أوقات غوصتك وهوامش الأمان</li>
<li>تقصير فترات السطح حتى تتمكن من قضاء المزيد من الوقت في الغوص ووقت أقل في الانتظار</li>
<li>تخطيط وغوص أفضل وأكثر أماناً</li>
</ul>

<p>الدورة نظرية إلا أنه عند حصولك على الرخصة بالأمكان توفير اسطوانات نيتروكس برسوم اضافية.</p>'],
                ],
            ],
            [
                'name' => 'Open Water Diver Course',
                'slug' => 'open-water-diver-course',
                'description' => '<p>The Open Water Diver course is the foundation diving course and consists of:</p>

<ol>
<li>Theory: 2-3 sessions</li>
<li>Practical pool training: 2 days (4 hours daily)</li>
<li>Practical sea application: 2 days (total of 4 dives)</li>
</ol>

<p>The course qualifies you to dive to 18 meters. It also opens the door to other courses such as Advanced Diving (qualifying you to dive to 30 meters), and exciting specialties like Perfect Buoyancy, Search and Recovery, Underwater Photography, and many more.</p>

<p>Our courses are accredited by international organizations such as SSI and PADI. Trainees receive an international license qualifying them to dive anywhere in the world. All our courses are accredited by the Saudi Diving Federation.</p>

<p><strong>Fees include:</strong></p>
<ol>
<li>Training materials</li>
<li>Pool fees</li>
<li>Equipment for pool and sea and cylinders during the course (except personal equipment)</li>
<li>License issuance</li>
<li>Plastic card from the organization</li>
<li>Wall certificate</li>
</ol>

<p><strong>Fees do not include personal equipment:</strong></p>
<ol>
<li>Mask</li>
<li>Snorkel</li>
<li>Boots</li>
<li>Fins</li>
<li>Wetsuit</li>
</ol>

<p><strong>Course requirements:</strong></p>
<ol>
<li>The trainee must be able to swim and float (high skill not required)</li>
<li>Approval of the medical statement (some conditions do not conflict with diving but require a doctor\'s note for your safety)</li>
<li>Agreement to the center\'s terms and conditions</li>
</ol>',
                'image' => 'courses/open-water-1.jpg',
                'price' => 2500.00,
                'level' => 'Beginner',
                'category' => 'Start Diving',
                'is_active' => true,
                'is_featured' => true,
                'has_certificate' => true,
                'translations' => [
                    'name' => ['ar' => 'دورة الغوص الأبتدائية (المياه المفتوحة)'],
                    'description' => ['ar' => '<p>دورات الغوص الابتدائية تسمى المياه المفتوحة وتتكون من:</p>

<ol>
<li>النظري: 2-3 حصص</li>
<li>التدريب العملي في المسبح: 2 أيام (4 ساعات يومياً)</li>
<li>التطبيق العملي في البحر: يومين (المجموع 4 غواصات)</li>
</ol>

<p>تؤهلك الدورة للغوص لـ 18 متر. تتيح لك دورات غوص ابتدائية الفرصة لدخول دورات أخرى كالغوص المتقدم التي تؤهلك للغوص لـ 30 متر، ودورات رائعة كالطفوية المثالية، البحث والانتشال، التصوير تحت الماء وغيرها كثير...</p>

<p>الدورات معتمدة من قبل منظمات عالمية مثل منظمة اس اس آي العالمية المشهورة ومنظمة بادي ويحصل المتدرب على رخصة عالمية تؤهله للغوص في أي مكان في العالم. وجميع دوراتنا معتمدة من قبل الاتحاد السعودي للغوص.</p>

<p><strong>تشمل الرسوم:</strong></p>
<ol>
<li>رسوم المواد التعليمية</li>
<li>رسوم المسبح</li>
<li>رسوم المعدات للمسبح والبحر والاسطوانات خلال الدورة (ما عدا المعدات الشخصية)</li>
<li>استخراج الرخصة</li>
<li>رسوم البطاقة البلاستيكية من المنظمة</li>
<li>الشهادة الجدارية</li>
</ol>

<p><strong>لا تشمل الرسوم المعدات الشخصية وهي:</strong></p>
<ol>
<li>النظارة</li>
<li>القصبة الهوائية أو السنوركل</li>
<li>الجزمة</li>
<li>الزعانف</li>
<li>الملابس أو البدلة</li>
</ol>

<p><strong>شروط الدورة:</strong></p>
<ol>
<li>أن يكون المتدرب يجيد السباحة والطفو (لا يستوجب مهارة عالية)</li>
<li>الموافقة على الإفادة الطبية (بعض الأمراض لا تتعارض مع الغوص ولكن تستوجب إفادة من طبيبك لضمان سلامتك)</li>
<li>الموافقة على شروط المركز</li>
</ol>'],
                ],
            ],
            [
                'name' => 'Swimming Course',
                'slug' => 'swimming-course',
                'description' => '<p>How many times have you walked by the sea and wished you could feel its magic on your body and swim with the gentle waves?</p>

<p>How many times have you wished you could join friends and family swimming in a resort or hotel pool during trips?</p>

<p>Don\'t you feel you\'re missing out on a lot of fun?</p>

<p>We handle fear and anxiety in a professional way.</p>

<p><strong>Beginner Swimming Course details:</strong></p>
<ul>
<li>Duration: 8-10 hours</li>
</ul>

<p><strong>The trainee learns:</strong></p>
<ul>
<li>Freestyle swimming</li>
<li>Backstroke</li>
<li>Floating or what is called treading water</li>
</ul>

<p>If you already know how to swim and want more advanced training courses, contact us for prices and details.</p>',
                'image' => 'courses/swimming-course.png',
                'price' => 1500.00,
                'level' => 'Beginner',
                'category' => 'Swim Programs',
                'is_active' => true,
                'is_featured' => true,
                'has_certificate' => true,
                'translations' => [
                    'name' => ['ar' => 'دورة سباحة'],
                    'description' => ['ar' => '<p>كم مرة تمشيت بجانب البحر وتمنيت أن تحس بسحره على جسمك وأن تسبح مع الموج الناعم؟</p>

<p>كم مرة تمنيت أن تشارك الأصدقاء والعائلة في السباحة في مسبح الاستراحة أو الفندق في الرحلات؟</p>

<p>ألا تحس أنك تفوت الكثير من المتعة؟</p>

<p>نحن نتعامل مع الخوف والرهبة بطريقة احترافية.</p>

<p><strong>تفاصيل دورة السباحة الابتدائية:</strong></p>
<ul>
<li>عدد الساعات: 8-10 ساعات</li>
</ul>

<p><strong>يتعلم المتدرب:</strong></p>
<ul>
<li>السباحة الحرة</li>
<li>سباحة الظهر</li>
<li>الطفو أو ما يسمى الوقوف في الماء</li>
</ul>

<p>إذا كنت تعرف كيف تسبح وتريد المزيد من الدورات التدريبية المتقدمة، اتصل بنا للحصول على الأسعار والتفاصيل.</p>'],
                ],
            ],
            [
                'name' => 'Stress & Rescue Course',
                'slug' => 'stress-rescue-course',
                'description' => '<p>The Stress & Rescue specialty program teaches you the skills you need to protect yourself and other divers.</p>

<p><strong>What you will learn:</strong></p>
<ul>
<li>How to identify stress in divers</li>
<li>How to prevent accidents</li>
<li>Practical techniques for conducting rescues and providing emergency care</li>
<li>Pool and open water training sessions to become well-prepared and confident in handling emergencies</li>
</ul>

<p>The rescue course consists of one theory day and two practical training days in the pool and sea.</p>

<p>It is best to combine this course with the SSI React Right course or PADI First Responder. These courses include several specialties starting from basic first aid for surface injuries, progressing to CPR, oxygen provision for the injured, and use of AED (defibrillator). These courses equip you with first aid skills for adults and children.</p>

<p><strong>Please contact us via email or WhatsApp before payment for registration and scheduling.</strong></p>',
                'image' => 'courses/stress-rescue-course.jpg',
                'price' => 2000.00,
                'level' => 'Intermediate',
                'category' => 'Develop Your Diving',
                'is_active' => true,
                'is_featured' => true,
                'has_certificate' => true,
                'translations' => [
                    'name' => ['ar' => 'دورة الإجهاد والإنقاذ'],
                    'description' => ['ar' => '<p>يعلمك برنامج الضغوط والإنقاذ التخصصي المهارات التي تحتاجها لحماية نفسك والغواصين الآخرين.</p>

<p><strong>ماذا ستتعلم:</strong></p>
<ul>
<li>كيفية تحديد الإجهاد عند الغواصين</li>
<li>كيفية منع وقوع الحوادث</li>
<li>تقنيات عملية لإجراء عمليات الإنقاذ وتقديم الرعاية في حالات الطوارئ</li>
<li>جلسات تدريب في المسبح والمياه المفتوحة لتكون مستعداً وواثقاً في التعامل مع حالات الطوارئ</li>
</ul>

<p>تتكون دورة الإنقاذ من يوم نظري ويومين تمارين عملية في المسبح والبحر.</p>

<p>من الأفضل الجمع بين هذه الدورة ودورة التصرف الصحيح من SSI أو المسعف الأول من PADI. هذه الدورات تشمل عدة تخصصات تبدأ من الإسعافات الأولية البسيطة لجروح سطحية وترتقي للإنعاش القلبي والرئوي بالإضافة إلى معرفة كيفية تزويد الأوكسجين للمصاب واستخدام جهاز الصدمات الكهربائية. هذه الدورات تزودك بمهارات الإسعافات للكبار والأطفال.</p>

<p><strong>الرجاء التواصل على الإيميل أو الواتس قبل الدفع للتسجيل والجدولة.</strong></p>'],
                ],
            ],
        ];

        foreach ($courses as $courseData) {
            $translations = $courseData['translations'] ?? [];
            unset($courseData['translations']);

            $course = Course::updateOrCreate(
                ['slug' => $courseData['slug']],
                $courseData
            );

            // Create image record if the file exists in storage
            if ($course->image && !$course->images()->where('path', $course->image)->exists()) {
                $ext = pathinfo($course->image, PATHINFO_EXTENSION);
                $course->images()->create([
                    'filename' => basename($course->image),
                    'path' => $course->image,
                    'url' => '/storage/' . $course->image,
                    'mime_type' => 'image/' . ($ext === 'png' ? 'png' : 'jpeg'),
                    'size' => file_exists(storage_path('app/public/' . $course->image))
                        ? filesize(storage_path('app/public/' . $course->image))
                        : 0,
                    'collection' => 'main',
                    'order' => 0,
                ]);
            }

            if (!empty($translations)) {
                $course->saveTranslations($translations);
            }
        }
    }

    private function seedBanners(): void
    {
        $banners = [
            [
                'title' => 'Have you ever wondered what it feels like to breathe underwater?',
                'description' => '"Most people have never experienced their first breath underwater." At CAS, we guide you through that moment safely and confidently.',
                'image' => 'banners/adventure.jpg',
                'button_text' => 'Start Your Diving Journey with CAS',
                'button_link' => '/shop/courses?category=Start+Diving',
                'position' => 'hero',
                'display_order' => 1,
                'is_active' => true,
                'translations' => [
                    'title' => ['ar' => 'هل تساءلت يومًا كيف يبدو التنفس تحت الماء؟'],
                    'description' => ['ar' => '"معظم الناس لم يختبروا أول نفس لهم تحت الماء." في CAS، نرشدك خلال تلك اللحظة بأمان وثقة.'],
                    'button_text' => ['ar' => 'ابدأ رحلتك في الغوص مع CAS'],
                ],
            ],
            [
                'title' => 'The Ocean Changes the Way You Think',
                'description' => 'CAS programs focus on calmness, awareness, and disciplined diving.',
                'image' => 'banners/discovery.jpg',
                'position' => 'hero',
                'display_order' => 2,
                'is_active' => true,
                'translations' => [
                    'title' => ['ar' => 'المحيط يغيّر طريقة تفكيرك'],
                    'description' => ['ar' => 'برامج CAS تركز على الهدوء والوعي والانضباط في الغوص.'],
                ],
            ],
            [
                'title' => 'Diving Is Learned — Not Just Experienced',
                'description' => 'Structured training pathways from beginner to advanced divers.',
                'image' => 'banners/fun.jpg',
                'position' => 'hero',
                'display_order' => 3,
                'is_active' => true,
                'translations' => [
                    'title' => ['ar' => 'الغوص يُتعلَّم — لا يُجرَّب فقط'],
                    'description' => ['ar' => 'مسارات تدريبية منظمة من المبتدئ إلى الغواص المتقدم.'],
                ],
            ],
        ];

        foreach ($banners as $data) {
            $translations = $data['translations'] ?? [];
            unset($data['translations']);

            $banner = Banner::updateOrCreate(
                ['title' => $data['title']],
                $data
            );

            if (!empty($translations)) {
                $banner->saveTranslations($translations);
            }
        }
    }

    private function seedTeamMembers(): void
    {
        $member = TeamMember::updateOrCreate(
            ['name' => 'Aisha Alhajjaj'],
            [
                'name' => 'Aisha Alhajjaj',
                'role' => 'Founder & Managing Director',
                'bio' => '<p>Aisha Alhajjaj is the founder and managing director of Corals & Shells Diving Center (CAS). She is an SSI Instructor Trainer for recreational scuba diving, a technical diving instructor, a classified instructor trainer, and an advanced freediver, with extensive experience in diver education, instructor development, and complex diving environments. Her professional diving background is further strengthened by her role as a certified dive physician and a member of the Undersea & Hyperbaric Medical Society (UHMS), allowing her to integrate physiology, risk management, and medical oversight into everyday dive operations.</p>
<p>Aisha holds an MA in Sport Industry and Lifestyle Management and is a board-certified neurosurgeon and neurointerventionist, bringing a deep understanding of neurological safety, human performance, and decision-making under pressure.</p>
<p>But CAS is more than one person; it\'s a collective of "visionaries." Together, this team of instructors and professionals has built a culture centered on smaller groups, adaptive inclusion, and quieter underwater experiences. Whether it\'s through our marine awareness framework, Passport Blue™, or our Elite CAS community, we aren\'t just teaching people to dive; we\'re building a new standard for diving in Saudi Arabia and the GCC—one grounded in care, competence, and a deep respect for the sea.</p>',
                'image' => 'team/aisha-alhajjaj.jpg',
                'experience' => '10+ Years of Diving Expertise',
                'certifications' => [
                    'SSI Instructor Trainer for recreational scuba diving',
                    'Technical diving instructor',
                    'Classified instructor trainer',
                    'Advanced freediver',
                    'Board-certified neurosurgeon and neurointerventionist',
                    'MA in Sport Industry and Lifestyle Management',
                    'Member of the Undersea & Hyperbaric Medical Society (UHMS)',
                ],
                'is_active' => true,
                'display_order' => 1,
            ]
        );

        // Save Arabic translations
        $member->saveTranslations([
            'name' => ['ar' => 'عائشة الحجاج'],
            'role' => ['ar' => 'المؤسس والمدير التنفيذي'],
            'bio' => ['ar' => '<p>عائشة الحجاج هي المؤسس والمدير التنفيذي لمركز "كورالز آند شيلز" للغوص وهي مدربة مدربي غوص ترفيهي ومدربة غوص تقني، ومدربة مدربي غوص لذوي الاحتياجات الخاصة وغواصة "فري دايف" متقدمة، وتتمتع بخبرة واسعة في تعليم الغواصين، وتطوير المدربين، والتعامل مع بيئات الغوص المعقدة. كما يتعزز مسارها المهني في الغوص بكونها طبيبة غوص معتمدة وعضواً في الجمعية الطبية لبيئات تحت البحر والضغط العالي (UHMS)، مما يتيح لها دمج علم وظائف الأعضاء، وإدارة المخاطر، والإشراف الطبي في عمليات الغوص اليومية.</p>
<p>تحمل عائشة درجة الماجستير في إدارة الصناعة الرياضية ونمط الحياة، وهي استشارية جراحة أعصاب وقسطرة دماغية معتمدة، مما يمنحها فهماً عميقاً للسلامة العصبية، والأداء البشري، واتخاذ القرار تحت الضغط.</p>
<p>مركز "كورالز آند شيلز" ليس مجرد مجهود فردي؛ بل هو تجمّع من "المستشرفين". لقد نجح هذا الفريق من المدربين والمحترفين في بناء ثقافة ترتكز على المجموعات الصغيرة، والشمولية التكيفية، وتجارب الغوص الهادئة. ومن خلال إطارنا للتوعية البحرية Passport Blue™ أو مجتمع "إيليت" Elite CAS، نحن لا نكتفي بتعليم الناس الغوص فحسب، بل نرسخ معياراً جديداً للغوص في المملكة العربية السعودية ودول مجلس التعاون الخليجي؛ معياراً قائماً على الرعاية، والكفاءة، والاحترام العميق للبحر.</p>'],
            'experience' => ['ar' => '+10 سنوات خبرة في الغوص'],
        ]);
    }
}
