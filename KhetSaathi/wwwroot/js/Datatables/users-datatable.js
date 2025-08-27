let usersTable;
const originUrl = window.location.origin;
const formAddEditUser = document.getElementById('form-add-edit-user');
const formChangePassword = document.getElementById('form-change-password');


$(document).ready(function () {
  
    ToastWrapper.init({
        positionClass: 'toast-top-right',
        timeOut: 3000,
        progressBar: true
    });

  
    usersTable = $('.datatables-users').DataTable({
        ajax: {
            url: `${originUrl}/User/GetByCompany`,
            data: function () {
                return { companyId: 1};
            },
            dataSrc: function (response) {
                return response.data || [];
            },
            error: function (xhr) {
                const errorMessage = xhr.responseJSON?.message || 'Failed to load users. Please try again.';
                ToastWrapper.error(errorMessage);
            }
        },
        columns: [
            {
                data: null,
                render: function (data, type, row) {
                    const fullName = `${row.firstName || ''} ${row.lastName || ''}`.trim();
                    const initials = (row.firstName?.charAt(0) || 'U').toUpperCase();
                    const colorClasses = ['bg-primary', 'bg-success', 'bg-info', 'bg-warning', 'bg-danger', 'bg-secondary', 'bg-dark'];
                    const hash = row.userID || fullName.charCodeAt(0) + fullName.length;
                    const colorClass = colorClasses[hash % colorClasses.length];

                    return `
                        <div class="d-flex align-items-center">
                            <div class="avatar avatar-initial ${colorClass} rounded-circle me-2"
                                 style="width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;">
                                <span class="fw-bold text-white">${initials}</span>
                            </div>
                            <span class="fw-semibold">${fullName}</span>
                        </div>
                    `;
                }
            },
            { data: 'email' },
            {
                data: 'roleName',
                render: data => `<span class="badge bg-info">${data || 'N/A'}</span>`
            },
            {
                data: 'isActive',
                render: isActive => {
                    const statusClass = isActive ? 'bg-success' : 'bg-danger';
                    return `<span class="badge ${statusClass}">${isActive ? 'Active' : 'Inactive'}</span>`;
                }
            },
            {
                data: 'lastLogin',
                render: date => date ? moment(date).format('DD MMM YYYY, HH:mm') : 'Never'
            },
            {
                data: null,
                orderable: false,
                searchable: false,
                render: function (data) {
                    return `
                        <div class="d-flex align-items-center gap-2">
                            <i class="ti ti-edit text-primary cursor-pointer btn-edit" data-id="${data.userID}" title="Edit User" style="font-size: 1.2rem;"></i>
                            <i class="ti ti-key text-warning cursor-pointer btn-change-password" data-id="${data.userID}" title="Change Password" style="font-size: 1.2rem;"></i>
                            <i class="ti ti-trash text-danger cursor-pointer btn-delete" data-id="${data.userID}" title="Delete User" style="font-size: 1.2rem;"></i>
                        </div>
                    `;
                }
            }
        ],
        order: [[0, 'asc']],
        dom: '<"row"<"col-md-2"<"ms-n2"l>><"col-md-10"<"dt-action-buttons text-xl-end text-lg-start text-md-end text-start d-flex align-items-center justify-content-end flex-md-row flex-column mb-6 mb-md-0 mt-n6 mt-md-0"fB>>>t<"row"<"col-sm-12 col-md-6"i><"col-sm-12 col-md-6"p>>',
        buttons: [
            {
                text: '<i class="ti ti-plus me-1"></i><span class="d-none d-sm-inline-block">Add User</span>',
                className: 'add-new btn btn-primary btn-sm m-2',
                action: function () {
                    showAddEditUserForm();
                }
            }
        ],
        language: {
            processing: '<div class="spinner-border text-primary" role="status"></div> Loading...',
            searchPlaceholder: 'Search Users...',
            lengthMenu: '_MENU_ entries per page',
            info: 'Showing _START_ to _END_ of _TOTAL_ users',
            infoEmpty: 'No records to display!',
            emptyTable: 'No records to display!',
            zeroRecords: 'No records to display!'
        }
    });

    
    $(document).on('click', '.btn-edit', function () {
        console.log("edit clicked");
        const id = $(this).data('id');
        if (id) {
            showAddEditUserForm(this);
        } else {
            ToastWrapper.error('Invalid user ID');
        }
    });

    $(document).on('click', '.btn-delete', function () {
        const id = $(this).data('id');
        if (id) {
            deleteUser(id);
        } else {
            ToastWrapper.error('Invalid user ID');
        }
    });

    $(document).on('click', '.btn-change-password', function () {
        const id = $(this).data('id');
        if (id) {
            showChangePasswordModal(id);
        } else {
            ToastWrapper.error('Invalid user ID');
        }
    });

    // Event handlers for form buttons
    $(document).on('click', '#btn-save-user', function () {
        saveUser();
    });

    $(document).on('click', '#btn-change-password', function () {
        changePassword();
    });

    // Load roles on page load
    loadRoles();
});

function showAddEditUserForm(button = null) {
    try {
        const offcanvasEl = document.getElementById('offcanvasAddUser');
        const offcanvas = new bootstrap.Offcanvas(offcanvasEl);

        resetForm(); // Clear form and validation first

        if (button) {
            $('#offcanvasAddUserLabel').text('Edit User');
            $('#flag').val('U');
            loadUserData(button); // Load user data
        } else {
            $('#offcanvasAddUserLabel').text('Add New User');
            $('#flag').val('C');
            $('.password-field').show();
        }

        offcanvas.show(); // Only show after reset + load
    } catch (error) {
        console.error('Error showing form:', error);
        ToastWrapper.error('Error opening form. Please try again.');
    }
}

// Updated loadUserData function to use closest logic
function loadUserData(button) {
    try {
        const row = usersTable.row($(button).closest('tr'));
        const userData = row.data();

        if (!userData) {
            ToastWrapper.error('User data not found');
            return;
        }
        console.log(userData);
        $('#userId').val(userData.userID);
        $('#firstName').val(userData.firstName);
        $('#lastName').val(userData.lastName);
        $('#email').val(userData.email).prop('disabled', true);
        $('#roleID').val(userData.roleID).trigger('change');

        const isActive = userData.isActive !== undefined ? userData.isActive : true;
        $('#activeStatus').prop('checked', isActive);
        $('#inactiveStatus').prop('checked', !isActive);
        $('.password-field').hide(); // Hide password on edit
    } catch (error) {
        console.error('Error loading user data:', error);
        ToastWrapper.error('Failed to load user data. Please try again.');
    }
}


function saveUser() {
    debugger

        const flag = $('#flag').val();
        const userData = {
            firstName: $('#firstName').val(),
            lastName: $('#lastName').val(),
            email: $('#email').val(),
            roleId: $('#roleID').val(),
            isActive: $('input[name="isActive"]:checked').val() === 'true'
        };


        if (flag === 'U') {
            userData.userID = $('#userId').val();
        }

        if (flag === 'C') {
            userData.password = $('#password').val();
        }

        const saveBtn = $('#btn-save-user');
        const originalText = saveBtn.html();
        saveBtn.html('<span class="spinner-border spinner-border-sm me-2"></span>Saving...').prop('disabled', true);

        $.ajax({
            url: flag === 'C' ? `${originUrl}/User/Add` : `${originUrl}/User/Update`,
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(userData),
            success: function (response) {
                if (response.success) {
                    ToastWrapper.success(response.message || 'User saved successfully');
                    usersTable.ajax.reload();
                    bootstrap.Offcanvas.getInstance('#offcanvasAddUser').hide();
                } else {
                    ToastWrapper.error(response.message || 'Failed to save user');
                }
            },
            error: function (xhr) {
                const errorMessage = xhr.responseJSON?.message || 'An error occurred while saving the user.';
                ToastWrapper.error(errorMessage);
            },
            complete: function () {
                // Restore button state
                saveBtn.html(originalText).prop('disabled', false);
            }
        });

}

function resetForm() {
    try {
      
        if (formAddEditUser) {
            formAddEditUser.reset();
            
            $('#userId').val('');
            $('#flag').val('C'); // Default to 'Create' mode
            $('#email').val('').prop('disabled', false);
            $('#roleID').val('').trigger('change');
            $('#activeStatus').prop('checked', true);
            $('#inactiveStatus').prop('checked', false);
            
            // Clear password fields and show/hide appropriately
            $('#password').val('');
            $('.password-field').show(); // Default to show for add mode
        }
    } catch (error) {
        console.error('Error resetting form:', error);
        ToastWrapper.error('Error resetting form. Please try again.');
    }
}


function showChangePasswordModal(userId) {
    try {
        $('#uid').val(userId);
        $('#newPassword, #confirmPassword').val('');
        
        $('#changePasswordModal').modal('show');
    } catch (error) {
        console.error('Error showing change password modal:', error);
        ToastWrapper.error('Error opening password change form');
    }
}

function changePassword() {

        const data = {
            userName: $('#uid').val(),
            password: $('#newPassword').val()
        };

        // Show loading state
        const changeBtn = $('#btn-change-password');
        const originalText = changeBtn.html();
        changeBtn.html('<span class="spinner-border spinner-border-sm me-2"></span>Changing...').prop('disabled', true);

        $.ajax({
            url: `${originUrl}/User/ChangePassword`,
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(data),
            success: function (response) {
                if (response.success) {
                    ToastWrapper.success(response.message || 'Password changed successfully');
                    $('#changePasswordModal').modal('hide');
                } else {
                    ToastWrapper.error(response.message || 'Failed to change password');
                }
            },
            error: function (xhr) {
                const errorMessage = xhr.responseJSON?.message || 'An error occurred while changing the password.';
                ToastWrapper.error(errorMessage);
            },
            complete: function () {
                // Restore button state
                changeBtn.html(originalText).prop('disabled', false);
            }
        });
}

function deleteUser(userId) {
    if (!userId) {
        ToastWrapper.error('Invalid user ID');
        return;
    }

    Swal.fire({
        text: 'Are you sure you would like to delete this user?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, Delete',
        cancelButtonText: 'Cancel',
        customClass: {
            confirmButton: 'btn btn-danger me-2 waves-effect waves-light',
            cancelButton: 'btn btn-label-secondary waves-effect waves-light'
        },
        buttonsStyling: false
    }).then(function (result) {
        if (result.isConfirmed) {
            $.ajax({
                url: `${originUrl}/User/Delete`,
                data: { "userId": userId },
                method: 'POST',
                success: function (response) {
                    if (response.success) {
                        ToastWrapper.success(response.message || "User deleted successfully");
                        usersTable.ajax.reload();
                    } else {
                        ToastWrapper.error(response.message || 'Failed to delete user');
                    }
                },
                error: function (xhr) {
                    const errorMessage = xhr.responseJSON?.message || 'An error occurred while deleting the user.';
                    ToastWrapper.error(errorMessage);
                }
            });
        }
    });
}

function loadRoles() {
    $.ajax({
        url: `${originUrl}/User/GetAllRoles`,
        method: 'GET',
        success: function (response) {
            if (response.success && response.data) {
                const select = $('#roleID');
                select.empty().append('<option value="">Select Role</option>');

                response.data.forEach(function (role) {
                    select.append(`<option value="${role.roleID}">${role.roleName}</option>`);
                });
            } else {
                ToastWrapper.error(response.message || 'Failed to load roles');
            }
        },
        error: function (xhr) {
            const errorMessage = xhr.responseJSON?.message || 'Failed to load roles. Please try again.';
            ToastWrapper.error(errorMessage);
        }
    });
}
