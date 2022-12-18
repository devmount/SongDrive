<template>
	<div class="modal modal-sm" :class="{ active: active }">
		<a href="#" class="modal-overlay" aria-label="Close" @click.prevent="emit('closed')"></a>
		<div class="modal-container">
			<div class="modal-header">
				<a href="#" class="btn btn-clear float-right" aria-label="Close" @click.prevent="emit('closed')"></a>
				<div class="modal-title h5">
					<span v-if="state=='new' || state=='registered'">{{ t('modal.addUser') }}</span>
					<span v-if="state=='confirmed'">{{ t('modal.editUser') }}</span>
				</div>
			</div>
			<div class="modal-body">
				<div class="content">
					<!-- name -->
					<label class="form-label" for="user-name">{{ t('field.name') }} <span class="text-error">*</span></label>
					<input
						id="user-name"
						type="text"
						v-model="user.name"
						class="form-input mb-1"
						:class="{ 'is-error': error.name }"
						:placeholder="t('placeholder.exampleUserName')"
					/>
					<p v-if="error.name" class="form-input-hint">{{ t('error.requiredName') }}</p>
					<!-- email -->
					<label class="form-label" for="user-email">{{ t('field.email') }} <span class="text-error">*</span></label>
					<input
						id="user-email"
						type="email"
						v-model="user.email"
						class="form-input mb-1"
						:class="{ 'is-error': error.email }"
						:placeholder="t('placeholder.exampleUserEmail')"
					/>
					<p v-if="error.email" class="form-input-hint">{{ t('error.requiredEmail') }}</p>
					<!-- password -->
					<div v-if="state=='new'">
						<label class="form-label" for="password">
							{{ t('field.password') }} <span class="text-error">*</span>
							<span class="float-right" :class="{ 'text-error': user.password.length < 8 }">
								{{ user.password.length }}<span v-if="user.password.length < 8"> / 8</span>
							</span>
						</label>
						<input
							id="password"
							type="password"
							v-model="user.password"
							class="form-input mb-1"
							:class="{ 'is-error': error.password.missing || error.password.tooshort }"
							:placeholder="t('placeholder.examplePassword', { p: example.password })"
						/>
						<p v-if="error.password.missing || error.password.tooshort" class="form-input-hint">
							<span v-if="error.password.missing">{{ t('error.requiredPassword') }}</span>
							<span v-if="error.password.tooshort"> {{ t('error.passwordTooShort') }}</span>
						</p>
					</div>
					<!-- role -->
					<label class="form-label" for="role">{{ t('field.role') }} <span class="text-error">*</span></label>
					<select v-model="permission.role" id="role" class="form-select filter" required>
						<option value="" disabled selected>{{ t('placeholder.select') }}</option>
						<option v-for="(r, k) in userRoles" :key="k" :value="k">{{ t('role.' + k) }}</option>
					</select>
				</div>
				<!-- admin password confirmation -->
				<div v-if="state=='new'">
					<hr />
					<label class="form-label" for="adminpassword">{{ t('text.confirmWithAdminPassword') }} <span class="text-error">*</span></label>
					<input
						id="adminpassword"
						type="password"
						v-model="admin.password"
						class="form-input mb-1"
						:class="{ 'is-error': error.adminpassword }"
					/>
					<p v-if="error.adminpassword" class="form-input-hint">{{ t('error.requiredPassword') }}</p>
				</div>
			</div>
			<div class="modal-footer">
				<a class="btn btn-link btn-gray" href="#" aria-label="Cancel" @click.prevent="emit('closed')">
					{{ t('button.cancel') }}
				</a>
				<button class="btn btn-primary ml-2" @click="setUser">
					<span v-if="state=='new' || state=='registered'">{{ t('button.addUser') }}</span>
					<span v-if="state=='confirmed'">{{ t('button.updateUser') }}</span>
				</button>
			</div>
		</div>
	</div>
</template>

<script setup>
import { ref, reactive, computed, inject } from 'vue';
import { useI18n } from "vue-i18n";
import { notify } from '@kyvg/vue3-notification';
import firebase from 'firebase/compat/app';
import { userRoles, throwError, randomString } from '@/utils.js';
const { t } = useI18n();

// global properties
const db = inject('db');

// inherited properties
const props = defineProps({
	active: Boolean,     // state of modal display, true to show modal
	userId: String,      // user id, if user or registration exists
	initialUser: Object, // user object with name, email and password
	role: String,        // user role for permission
	state: String,       // user state: confirmed | registered | new
});

// reactive data
const user = ref(JSON.parse(JSON.stringify(props.initialUser)));
const permission = reactive({
	role: props.role
});
const admin = reactive({
	password: ''
});
const example = reactive({
	password: randomString(8)
});
const error = reactive({
	name: false,
	email: false,
	password: {
		missing: false,
		tooshort: false,
	},
	role: false,
	adminpassword: false
});

// emits
const emit = defineEmits(['started', 'closed']);

// computed: calculate wether form errors occured
const errors = computed(() => (
	error.name ||
	error.email ||
	error.password.missing ||
	error.password.tooshort ||
	error.role ||
	error.adminpassword
));

// save user object to database
const setUser = () => {
	// first check for form errors
	error.name = user.value.name == '';
	error.email = user.value.email == '';
	error.password.missing = props.state == 'new' && user.value.password == '';
	error.password.tooshort = props.state == 'new' && user.value.password.length < 8;
	error.role = permission.role == '';
	error.adminpassword = props.state == 'new' && admin.password == '';
	// no errors: send submitted user data and close modal
	if (!errors.value) {
		// user exists and is confirmed
		if (props.state == 'confirmed') {
			// first set permissions
			db.collection('permissions').doc(props.userId).update(permission).then(() => {
				// permissions updated successfully, now update user
				db.collection('users').doc(props.userId).update({
					name: user.value.name,
					email: user.value.email,
				}).then(() => {
					emit('closed');
					notify({
						title: t('toast.userUpdated'),
						text: t('toast.userSavedText'),
						type: 'primary'
					});
				}).catch((error) => throwError(error));
			}).catch((error) => throwError(error));
		}
		// user is not yet confirmed
		if (props.state == 'registered') {
			// first set permissions
			db.collection('permissions').doc(props.userId).set(permission).then(() => {
				// permissions updated successfully, now create user
				db.collection('users').doc(props.userId).set({
					name: user.value.name,
					email: user.value.email,
				}).then(() => {
					// user created successfully, now delete registration
					db.collection('registrations').doc(props.userId).delete().then(() => {
						emit('closed');
						notify({
							title: t('toast.userAdded'),
							text: t('toast.userSavedText'),
							type: 'primary'
						});
					}).catch((error) => throwError(error));
				}).catch((error) => throwError(error));
			}).catch((error) => throwError(error));
		}
		// user doesn't exist
		if (props.state == 'new') {
			emit('started');
			const adminUser = firebase.auth().currentUser;
			const credential = firebase.auth.EmailAuthProvider.credential(adminUser.email, admin.password);
			// first check if admin is authentic
			adminUser.reauthenticateWithCredential(credential).then(() => {
				// create firebase user, this automatically signs in as the new user
				firebase.auth().createUserWithEmailAndPassword(user.value.email, user.value.password).then(() => {
					// get new user id as long as still logged in as the new user
					const userId = firebase.auth().currentUser.uid;
					// send verification email to new user
					firebase.auth().currentUser.sendEmailVerification().then(() => {
						// now sign the new user out ...
						firebase.auth().signOut().then(() => {
							// ... and relogin with own admin user profile again
							firebase.auth().signInWithEmailAndPassword(adminUser.email, admin.password).then(() => {
								// now save permissions for new user (which is only possible cause you're admin again)
								db.collection('permissions').doc(userId).set(permission).then(() => {
									// permissions created successfully, now create user doc in users collection
									db.collection('users').doc(userId).set({
										name: user.value.name,
										email: user.value.email,
									}).then(() => {
										// finally finished! Close modal and toast success
										emit('closed');
										notify({
											title: t('toast.userAdded'),
											text: t('toast.userAddedText'),
											type: 'primary'
										});
									}).catch((error) => throwError(error));
								}).catch((error) => throwError(error));
							}).catch((error) => throwError(error));
						}).catch((error) => throwError(error));
					}).catch((error) => throwError(error));
				}).catch((error) => throwError(error));
			}).catch((error) => throwError(error));
		}
	}
};
</script>
