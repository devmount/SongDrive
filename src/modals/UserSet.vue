<template>
	<modal
		:active="active"
		:title="state=='new' || state=='registered' ? t('modal.addUser') : t('modal.editUser')"
		@closed="emit('closed')"
	>
		<div class="flex flex-col gap-2">
			<!-- name -->
			<label class="flex flex-col gap-1">
				<div>{{ t('field.name') }} <span class="text-rose-600">*</span></div>
				<input
					type="text"
					v-model="user.name"
					:class="{ 'border-rose-600': error.name }"
					:placeholder="t('placeholder.exampleUserName')"
				/>
			</label>
			<div v-if="error.name" class="text-rose-600">{{ t('error.requiredName') }}</div>
			<!-- email -->
			<label class="flex flex-col gap-1">
				<div>{{ t('field.email') }} <span class="text-rose-600">*</span></div>
				<input
					type="email"
					v-model="user.email"
					:class="{ 'border-rose-600': error.email }"
					:placeholder="t('placeholder.exampleUserEmail')"
				/>
			</label>
			<div v-if="error.email" class="text-rose-600">{{ t('error.requiredEmail') }}</div>
			<!-- password -->
			<template v-if="state=='new'">
				<label class="flex flex-col gap-1">
					<span class="flex justify-between">
						<span>{{ t('field.password') }} <span class="text-rose-600">*</span></span>
						<span :class="{ 'text-rose-600': user.password.length < 8 }">
							{{ user.password.length }}<span v-if="user.password.length < 8"> / 8</span>
						</span>
					</span>
					<input
						type="password"
						v-model="user.password"
						:class="{ '!border-rose-600': errorsPassword }"
						:placeholder="t('placeholder.examplePassword', { p: examplePassword })"
					/>
				</label>
				<div
					v-if="errorsPassword"
					class="text-rose-600"
				>
					<span v-if="error.password.missing">{{ t('error.requiredPassword') }}&nbsp;</span>
					<span v-if="error.password.tooshort">{{ t('error.passwordTooShort') }}</span>
				</div>
			</template>
			<!-- role -->
			<label class="flex flex-col gap-1">
				<div>{{ t('field.role') }} <span class="text-rose-600">*</span></div>
				<select v-model="permission.role" required>
					<option v-for="(_, k) in userRoles" :key="k" :value="k">{{ t('role.' + k) }}</option>
				</select>
			</label>
			<divider-horizontal />
			<div v-if="state=='new'">
				<!-- user password reauthentification -->
				<label class="flex flex-col gap-1">
					<div>{{ t('text.confirmWithCurrentPassword') }} <span class="text-rose-600">*</span></div>
					<input
						type="password"
						v-model="admin.password"
						:class="{ 'border-rose-600': error.currentpassword.missing || error.currentpassword.wrong }"
					/>
				</label>
				<div v-if="error.currentpassword.missing" class="text-rose-600">
					{{ t('error.requiredPassword') }}
				</div>
				<div v-if="error.currentpassword.wrong" class="text-rose-600">
					{{ t('error.wrongPassword') }}
				</div>
			</div>
		</div>
		<div class="flex flex-col justify-end items-center gap-4 mt-4 2xs:flex-row">
			<button class="px-3 py-2 text-blade-500" aria-label="Cancel" @click.prevent="emit('closed')">
				{{ t('button.cancel') }}
			</button>
			<primary-button class="grow" @click="setUser">
				<span v-if="state !== 'confirmed'">{{ t('button.addUser') }}</span>
				<span v-else>{{ t('button.updateUser') }}</span>
				<icon-plus v-if="state !== 'confirmed'" class="w-6 h-6 stroke-1.5" />
				<icon-device-floppy v-else class="w-6 h-6 stroke-1.5" />
			</primary-button>
		</div>
	</modal>
</template>

<script setup>
import { notify } from '@kyvg/vue3-notification';
import { reactive, computed, inject, onMounted, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { userRoles, throwError, randomString } from '@/utils.js';
import DividerHorizontal from '@/elements/DividerHorizontal';
import firebase from 'firebase/compat/app';
import Modal from '@/elements/Modal';
import PrimaryButton from '@/elements/PrimaryButton';

// icons
import { IconPlus, IconDeviceFloppy } from '@tabler/icons-vue';

// component constants
const { t } = useI18n();
const examplePassword = randomString(8);

// global properties
const db = inject('db');

// component properties
const props = defineProps({
	active: Boolean,     // state of modal display, true to show modal
	userId: String,      // user id, if user or registration exists
	initialUser: Object, // user object with name, email and password
	role: String,        // user role for permission
	state: String,       // user state: confirmed | registered | new
});

// user input data
const user = reactive({
	name: '',
	email: '',
	password: ''
});
const permission = reactive({
	role: ''
});
const initInput = () => {
	user.name = props.initialUser.name;
	user.email = props.initialUser.email;
	permission.role = props.role;
};
onMounted(() => initInput());
watch(() => props.active, () => initInput());

// admin password for confirmation
const admin = reactive({
	password: ''
});

// component emits
const emit = defineEmits(['started', 'closed']);

// computed: calculate if any form errors occured
const error = reactive({
	name: false,
	email: false,
	password: {
		missing: false,
		tooshort: false,
	},
	role: false,
	currentpassword: {
		missing: false,
		wrong: false,
	}
});
const errorsPassword = computed(() => (
	error.password.missing ||
	error.password.tooshort
));
const errors = computed(() => (
	error.name ||
	error.email ||
	error.password.missing ||
	error.password.tooshort ||
	error.role ||
	error.currentpassword.missing
));

// save user object to database
const setUser = () => {
	// first check for form errors
	error.name = user.name == '';
	error.email = user.email == '';
	error.password.missing = props.state == 'new' && user.password == '';
	error.password.tooshort = props.state == 'new' && user.password?.length < 8;
	error.role = permission.role == '';
	error.currentpassword.missing = props.state == 'new' && admin.password == '';
	// no errors: send submitted user data and close modal
	if (!errors.value) {
		// user exists and is confirmed
		if (props.state == 'confirmed') {
			// first set permissions
			db.collection('permissions').doc(props.userId).update(permission).then(() => {
				// permissions updated successfully, now update user
				db.collection('users').doc(props.userId).update({
					name: user.name,
					email: user.email,
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
					name: user.name,
					email: user.email,
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
			const adminUser = firebase.auth().currentUser;
			const credential = firebase.auth.EmailAuthProvider.credential(adminUser.email, admin.password);
			// first check if admin is authentic
			adminUser.reauthenticateWithCredential(credential).then(() => {
				emit('started');
				// create firebase user, this automatically signs in as the new user
				firebase.auth().createUserWithEmailAndPassword(user.email, user.password).then(() => {
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
										name: user.name,
										email: user.email,
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
			}).catch(() => {
				error.currentpassword.wrong = true;
				notify({
					title: t('toast.passwordWrong'),
					text: t('toast.passwordWrongText'),
					type: 'error'
				});
			});
		}
	}
};
</script>
