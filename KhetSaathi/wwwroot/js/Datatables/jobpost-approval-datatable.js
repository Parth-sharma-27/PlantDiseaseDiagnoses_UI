var jobpostapproval_table;
let jobPostData = [];


$(document).ready(() => {


    ToastWrapper.init({
        positionClass: 'toast-top-right',
        timeOut: 1500,
        progressBar: true

    });
    const baseUrl = window.origin;

    jobpostapproval_table = $('.datatables-jobs').DataTable({

        ajax: {
            url: `${baseUrl}/Job/GetPendingApprovals`,
            dataSrc: function (resp) {
                if (resp.success === true) {
                    jobPostData = resp.data;
                    return resp.data;
                } else {
                    toastr.error('Something went wrong fetching the report.');
                    return [];
                }
            }
        },
        columns: [
            { data: 'jobTitle', title: 'Job Title',},
            { data: 'department', title: 'Department' },
            { data: 'employmentType', title: 'Employment Type' },
            { data: 'createByUser', title: 'Created By' },
            { data: 'createdDate', title: 'Created Date' },
            { data: null } // Placeholder for the 'Actions' column
        ],

        columnDefs: [
            { targets: 0, orderable: true },
            {
                targets: 4,
                render: function (data, type, row) {
                    if (!data) return '';
                    const date = new Date(data);
                    return date.toLocaleString('en-GB', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                    }).replace(',', '');
                }
            },

            {
                targets: 5,
                orderable: false,
                searchable: false,
                render: function (data, type, full, meta) {
                    const token = full.uniqueToken ?? `${full.jobId}_${full.empId}`;
                    return `
                <div class="d-flex align-items-center">
                    <a class="btn btn-icon btn-text-secondary waves-effect waves-light rounded-pill view-jobpost" href="javascript:void(0);" data-uqid="${token}">
                        <i class="ti ti-eye text-primary" title="view"></i>
                    </a>
                    <a class="btn btn-icon btn-text-secondary waves-effect waves-light rounded-pill approve-jobpost" href="javascript:void(0);" data-uqid="${token}">
                        <i class="ti ti-check text-success" title="approve"></i>
                    </a>
                    <a class="btn btn-icon btn-text-secondary waves-effect waves-light rounded-pill reject-jobpost" href="javascript:void(0);" data-uqid="${token}">
                        <i class="ti ti-x text-danger" title="reject"></i>
                    </a>

                </div>
            `;
                }
            }
        ],

        order: [[4, 'desc']],
        responsive: true,
        dom: '<"row"<"col-md-2"<"ms-n2"l>><"col-md-10"<"dt-action-buttons text-xl-end text-lg-start text-md-end text-start d-flex align-items-center justify-content-end flex-md-row flex-column mb-6 mb-md-0 mt-n6 mt-md-0"fB>>>t<"row"<"col-sm-12 col-md-6"i><"col-sm-12 col-md-6"p>>',
        language: {
            sLengthMenu: '_MENU_',
            search: '',
            searchPlaceholder: 'Search',
            paginate: {
                next: '<i class="ti ti-chevron-right ti-sm"></i>',
                previous: '<i class="ti ti-chevron-left ti-sm"></i>'
            }
        },

        buttons: [],

        initComplete: function (settings, json) {

        }

    });

    //show job post detail modal:
    $('.datatables-jobs tbody').on('click', '.view-jobpost', function () {

        $('.modal.show').each(function () {
            const modalInstance = bootstrap.Modal.getInstance(this);
            if (modalInstance) {
                modalInstance.hide();
            }
        });

        const token = $(this).data('uqid');
        const job = jobPostData.find(j => j.uniqueToken === token);
        if (!job) return;

        $('#modal-jobTitle').text(job.jobTitle ?? '');
        $('#modal-department').text(job.department ?? '');
        $('#modal-employmentType').text(job.employmentType ?? '');
        $('#modal-locationType').text(job.locationType ?? '');
        $('#modal-jobLocation').text(job.jobLocation ?? '');
        $('#modal-experience').text(
            job.experienceMin && job.experienceMax
                ? `${job.experienceMin} - ${job.experienceMax} years`
                : job.experienceMin
                    ? `${job.experienceMin}+ years`
                    : job.experienceMax
                        ? `Up to ${job.experienceMax} years`
                        : '—'
        );
        $('#modal-salary').text(
            job.salaryMin && job.salaryMax
                ? `${job.salaryMin} - ${job.salaryMax}`
                : job.salaryMin
                    ? `${job.salaryMin}+`
                    : '—'
        );
        $('#modal-currency').text(job.currency ?? '');
        $('#modal-createByUser').text(job.createByUser ?? '');
        $('#modal-createdDate').text(
            job.createdDate ? new Date(job.createdDate).toLocaleDateString('en-IN') : ''
        );
        $('#modal-jobDescription').text(job.jobDescription ?? '');


        const responsibilitiesArray = job.responsibilities ? job.responsibilities.split("$#$").filter(r => r.trim()) : [];
        responsibilitiesArray.forEach(reponsibility => {
            if (reponsibility.trim()) {
                $('#modal-responsibilities').append(
                    `<li><i class="fa-solid fa-arrow-right me-1 text-muted"></i>${reponsibility.trim()}</li>`
                );
            }
        });

        $('#modal-qualifications').text(job.qualifications ?? '');

        const skillsArray = job.keySkills ? job.keySkills.split("$#$").filter(skill => skill.trim()) : [];

        $('#modal-keySkills').empty();

        // Add each skill as a pil
        skillsArray.forEach(skill => {
            if (skill.trim()) {  // Only add if not empty after trim
                $('#modal-keySkills').append(
                    `<span class="badge bg-primary rounded-pill me-2 mb-2">${skill.trim()}</span>`
                );
            }
        });

        $('#modal-benefits').text(job.benefits ?? '');
        $('#modal-budgetJustification').text(job.budgetJustification ?? '');
        $('#modal-roleJustificaiton').text(job.roleJustificaiton ?? '');


        const modal = new bootstrap.Modal(document.getElementById('jobDetailModal'), {
            backdrop: 'static',
            keyboard: false
        });
        modal.show();
    });

    $('.datatables-jobs tbody').on('click', '.approve-jobpost, .reject-jobpost', function () {

        
        const $btn = $(this);
        const uId = $btn.data('uqid');

        if (!uId) {
            ToastWrapper.error("Something went wrong!");
            return;
        }

        const isApproved = $btn.hasClass('approve-jobpost')
        $("#uqid").val(uId);
        $("#approvalaction").val(isApproved);

        const modal = new bootstrap.Modal(document.getElementById('approvalModal'));
        modal.show();

        //const payload = {
        //    DAID: uid1,
        //    DAEmpId: uid2,
        //    ARBy: "",
        //    IsApproved: isApproved
        //};

        //$.ajax({
        //    url: `${baseUrl}/report/ApproveRejectDA`,
        //    type: 'POST',
        //    contentType: 'application/json',
        //    data: JSON.stringify(payload),
        //    success: function (resp) {
        //        if (resp.status > 0) {
        //            ToastWrapper.success(`DA ${isApproved ? 'approved' : 'rejected'} successfully.`);
        //            jobpostapproval_table.ajax.reload(null, false);
        //        } else {
        //            ToastWrapper.error('Something Went Wrong!');
        //        }

        //    },
        //    error: function (xhr) {
        //        ToastWrapper.error('Something Went Wrong!');
        //    }
        //});
    });

    $("#submitApprovalBtn").on('click', () => {

        const modalEl = document.getElementById('approvalModal');
        const modal = bootstrap.Modal.getInstance(modalEl);

        $("#approvalModal .modal-body").block({
            message: '<div class="spinner-border text-primary" role="status"></div>',

            css: {
                border: 'none',
                backgroundColor: 'transparent'
            },

            overlayCSS: {
                backgroundColor: '#fff',
                opacity: 0.8

            }
        });

        const uqid = $("#uqid").val();
        const at = $("#approvalaction").val();
        const remarksText = $("#remarksInput").val();

        const payload = {
            uniqueToken: uqid,
            approvalStatus: at === "true",
            remarks: remarksText
        };

        $.ajax({
            url: `${baseUrl}/job/UpdateJobPostApproval`,
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(payload),
            success: function (resp) {
                $("#approvalModal .modal-body").unblock();
                modal.hide();
                if (resp.success) {
                    ToastWrapper.success(`Job Post ${at === 'true' ? 'approved' : 'rejected'} successfully.`);
                    jobpostapproval_table.ajax.reload(null, false);
                } else {
                    ToastWrapper.error('Something Went Wrong!');
                }

            },
            error: function (xhr) {
                $("#approvalModal .modal-body").unblock();
                modal.hide();
                ToastWrapper.error('Something Went Wrong!');
            }
        });
        
    });

    $('#approvalModal').on('hidden.bs.modal', function () {
        $("#uqid").val('');
        $("#approvalaction").val('');
        $("#remarksInput").val('');
    });


    function populateBullets(containerId, rawString) {
        const container = document.getElementById(containerId);
        container.innerHTML = '';
        const items = rawString.split('$#$').map(s => s.trim()).filter(s => s !== "");
        items.forEach(item => {
            const li = document.createElement('li');
            li.textContent = item;
            li.classList.add("list-group-item", "ps-0", "border-0");
            container.appendChild(li);
        });
    }

    function populateTags(containerId, rawString) {
        const container = document.getElementById(containerId);
        container.innerHTML = '';
        const items = rawString.split('$#$').map(s => s.trim()).filter(s => s !== "");
        items.forEach(item => {
            const span = document.createElement('span');
            span.className = 'badge rounded-pill bg-primary text-white';
            span.textContent = item;
            container.appendChild(span);
        });
    }
});