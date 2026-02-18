<?php

use App\Models\FooterLink;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    public function up(): void
    {
        $footerLink = FooterLink::create([
            'title' => 'Terms & Conditions',
            'slug' => 'terms-and-conditions',
            'url' => '/pages/terms-and-conditions',
            'content' => '<h2>Terms &amp; Conditions</h2>
<p><strong>Corals &amp; Shells Diving Center</strong></p>

<h3>1. Acceptance of Terms</h3>
<p>Registration in any Corals &amp; Shells program constitutes full acceptance of these Terms &amp; Conditions. Participation is not permitted without prior agreement.</p>

<h3>2. Registration &amp; Eligibility</h3>
<ul>
<li>All programs are subject to specific age, health, and readiness requirements.</li>
<li>The center reserves the right to refuse or postpone participation if safety or readiness criteria are not met.</li>
<li>Certain programs and paths require prior assessment before acceptance.</li>
</ul>

<h3>3. Fees &amp; Payment</h3>
<ul>
<li>All fees are approved and fixed, with no informal discounts or exceptions unless explicitly stated.</li>
<li>Registration is confirmed only upon full payment.</li>
<li>Failure to complete payment by the specified deadline may result in automatic cancellation.</li>
</ul>

<h3>4. Cancellation, Changes &amp; Refunds</h3>
<ul>
<li>Cancellation and refund policies depend on the nature of each program. Refer to the course terms &amp; conditions that has to be signed prior to commencement of training.</li>
<li>Once a program has started, fees are non-refundable.</li>
<li>Cancellations prior to program start may be subject to administrative fees.</li>
<li>The center reserves the right to reschedule or cancel programs for operational or safety reasons, with prior notice when possible.</li>
</ul>

<h3>5. Safety &amp; Liability</h3>
<ul>
<li>Safety is a top priority, and all participants must follow instructors\' instructions at all times.</li>
<li>Participants acknowledge that water activities and diving involve inherent risks.</li>
<li>The center is not liable for injuries resulting from non-compliance with instructions or inaccurate health disclosures.</li>
</ul>

<h3>6. Medical Fitness</h3>
<ul>
<li>Participants (or guardians) are responsible for disclosing any medical conditions that may affect safety.</li>
<li>Medical declarations or certificates may be required for certain programs.</li>
</ul>

<h3>7. Attendance &amp; Commitment</h3>
<ul>
<li>Attendance and punctuality are essential for continued participation.</li>
<li>Repeated absence or lateness may result in removal from the program without refund.</li>
</ul>

<h3>8. Conduct &amp; Discipline</h3>
<ul>
<li>All participants are expected to behave respectfully toward instructors and others.</li>
<li>The center reserves the right to remove any participant who compromises safety or discipline, without refund.</li>
</ul>

<h3>9. Photography &amp; Media Use</h3>
<ul>
<li>Activities may be photographed or recorded for educational, documentation, or media purposes.</li>
<li>Participants who do not wish to appear must notify management in writing in advance.</li>
</ul>

<h3>10. Intellectual Property</h3>
<p>All content, training materials, and branding associated with Corals &amp; Shells are protected and may not be used without written permission.</p>

<h3>11. Amendments</h3>
<p>Corals &amp; Shells reserves the right to amend these Terms &amp; Conditions at any time. Updated versions will be published through official channels.</p>

<h3>12. Governing Law</h3>
<p>These Terms &amp; Conditions are governed by the laws and regulations of the Kingdom of Saudi Arabia.</p>',
            'display_order' => 2,
            'is_active' => true,
            'open_in_new_tab' => false,
        ]);

        $footerLink->saveTranslations([
            'title' => ['ar' => 'الشروط والأحكام'],
            'content' => ['ar' => '<h2>الشروط والأحكام</h2>
<p><strong>مركز مرجان وصدف للرياضات البحرية (Corals &amp; Shells)</strong></p>

<h3>1. القبول بالشروط</h3>
<p>يُعد تسجيل المشارك أو ولي أمره في أي من برامج مركز مرجان وصدف موافقة كاملة على هذه الشروط والأحكام. ولا يُسمح بالمشاركة في أي برنامج دون القبول المسبق بها.</p>

<h3>2. التسجيل والأهلية</h3>
<ul>
<li>تخضع جميع البرامج لمعايير عمرية وصحية محددة.</li>
<li>يحتفظ المركز بحق رفض أو تأجيل مشاركة أي شخص في حال عدم استيفاء شروط السلامة أو الجاهزية.</li>
<li>بعض البرامج والمسارات تتطلب تقييماً مسبقاً قبل القبول.</li>
</ul>

<h3>3. الرسوم والدفع</h3>
<ul>
<li>جميع الرسوم معتمدة ومعلنة ولا تشمل أي خصومات أو استثناءات غير مذكورة صراحة.</li>
<li>يتم تأكيد التسجيل فقط بعد إتمام الدفع.</li>
<li>عدم السداد في الموعد المحدد يؤدي إلى إلغاء الحجز تلقائياً.</li>
</ul>

<h3>4. الإلغاء، التغيير، والاسترجاع</h3>
<ul>
<li>تخضع سياسات الإلغاء والاسترجاع لطبيعة كل برنامج. الرجاء مراجعة شروط الدورات وتوقيعها قبل البدء بالتدريب.</li>
<li>بعد بدء البرنامج، لا يحق للمشارك المطالبة باسترجاع الرسوم.</li>
<li>في حال الإلغاء من قِبل المشارك قبل بدء البرنامج، قد تُطبق رسوم إدارية.</li>
<li>يحتفظ المركز بحق إلغاء أو تعديل مواعيد البرامج لأسباب تنظيمية أو تتعلق بالسلامة، مع إشعار مسبق قدر الإمكان.</li>
</ul>

<h3>5. السلامة والمسؤولية</h3>
<ul>
<li>السلامة أولوية قصوى، وعلى جميع المشاركين الالتزام بتعليمات المدربين في جميع الأوقات.</li>
<li>يقر المشارك أو ولي أمره بأن الأنشطة المائية والغوص تنطوي على مخاطر طبيعية.</li>
<li>لا يتحمل المركز أي مسؤولية عن إصابات ناتجة عن عدم الالتزام بالتعليمات أو تقديم معلومات صحية غير دقيقة.</li>
</ul>

<h3>6. اللياقة الصحية</h3>
<ul>
<li>يتحمل المشارك أو ولي أمره مسؤولية الإفصاح عن أي حالة صحية قد تؤثر على السلامة.</li>
<li>قد يُطلب تقديم إقرار طبي أو شهادة طبية لبعض البرامج.</li>
</ul>

<h3>7. الحضور والالتزام</h3>
<ul>
<li>الالتزام بالمواعيد شرط أساسي لاستمرار المشاركة.</li>
<li>الغياب أو التأخر المتكرر قد يؤدي إلى استبعاد المشارك دون تعويض.</li>
</ul>

<h3>8. السلوك والانضباط</h3>
<ul>
<li>يتوقع من جميع المشاركين الالتزام بالسلوك المناسب واحترام المدربين والمشاركين الآخرين.</li>
<li>يحتفظ المركز بحق استبعاد أي مشارك يخل بالانضباط أو السلامة دون استرجاع الرسوم.</li>
</ul>

<h3>9. التصوير والاستخدام الإعلامي</h3>
<ul>
<li>قد يتم تصوير الأنشطة لأغراض تعليمية أو توثيقية أو إعلامية.</li>
<li>في حال عدم الرغبة في الظهور، يجب إبلاغ الإدارة مسبقاً خطياً.</li>
</ul>

<h3>10. الملكية الفكرية</h3>
<p>جميع المحتويات، المواد التدريبية، والأسماء التجارية الخاصة بالمركز محمية ولا يجوز استخدامها دون إذن خطي.</p>

<h3>11. التعديلات</h3>
<p>يحتفظ مركز مرجان وصدف بحق تعديل هذه الشروط والأحكام في أي وقت، على أن يتم نشر النسخة المحدثة عبر القنوات الرسمية.</p>

<h3>12. القانون المعمول به</h3>
<p>تخضع هذه الشروط والأحكام لأنظمة وقوانين المملكة العربية السعودية.</p>'],
        ]);
    }

    public function down(): void
    {
        $link = FooterLink::where('slug', 'terms-and-conditions')->first();
        if ($link) {
            $link->deleteTranslations();
            $link->delete();
        }
    }
};
