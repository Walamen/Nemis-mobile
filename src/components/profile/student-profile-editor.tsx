import { Image } from 'expo-image';
import type { ReactNode } from 'react';
import { Controller } from 'react-hook-form';
import { ActivityIndicator } from 'react-native';

import { useGetMyStudentProfileQuery } from '@/api/student/student-profile-api';
import { Button } from '@/components/buttons/button';
import { Icon, type IconProps } from '@/components/common/icon';
import { QueryState } from '@/components/common/query-state';
import { SectionCaption } from '@/components/common/section-caption';
import { SkeletonProfile } from '@/components/loading/skeleton-profile';
import { ThemedText } from '@/components/typography/themed-text';
import { useProfilePhoto } from '@/features/profile/use-profile-photo';
import { useUpdateProfileForm } from '@/features/profile/use-update-profile-form';
import { useStudentIdentity } from '@/hooks/use-student-identity';
import { useTheme } from '@/hooks/use-theme';
import { Palette } from '@/theme';
import { Pressable, Text, TextInput, View } from '@/tw';
import { getCurrentClassName, getGuardianContact } from '@/utils/student-record';

const CAMERA_ICON: IconProps['name'] = {
  ios: 'camera.fill',
  android: 'photo_camera',
  web: 'photo_camera',
};
const LOCK_ICON: IconProps['name'] = { ios: 'lock', android: 'lock', web: 'lock' };
const AVATAR_SIZE = 96;
const WHITE = '#FFFFFF';

/** One labelled row inside a details card; `divider` draws the line under it. */
function DetailRow({
  label,
  children,
  divider,
  trailing,
}: {
  label: string;
  children: ReactNode;
  divider: boolean;
  trailing?: ReactNode;
}) {
  const theme = useTheme();
  return (
    <View
      className="flex-row items-center gap-3 px-4 py-3"
      style={divider ? { borderBottomWidth: 1, borderBottomColor: theme.border } : undefined}
    >
      <View className="flex-1 gap-0.5">
        <ThemedText type="small" themeColor="textSecondary" style={{ fontSize: 12 }}>
          {label}
        </ThemedText>
        {children}
      </View>
      {trailing}
    </View>
  );
}

function ProfilePhoto({ imageUrl, initials }: { imageUrl?: string | null; initials: string }) {
  const { changePhoto, isUploading, photoError, isPhotoSaved } = useProfilePhoto();

  return (
    <View className="items-center gap-2 pb-2">
      <Pressable
        onPress={() => void changePhoto()}
        disabled={isUploading}
        accessibilityRole="button"
        accessibilityLabel="Change photo"
        accessibilityState={{ busy: isUploading }}
      >
        <View
          className="items-center justify-center overflow-hidden rounded-full"
          style={{ width: AVATAR_SIZE, height: AVATAR_SIZE, backgroundColor: Palette.primary }}
        >
          {imageUrl ? (
            <Image
              source={{ uri: imageUrl }}
              style={{ width: '100%', height: '100%' }}
              contentFit="cover"
            />
          ) : (
            <ThemedText style={{ color: WHITE, fontSize: 32, fontWeight: '700', lineHeight: 40 }}>
              {initials}
            </ThemedText>
          )}
          {isUploading && (
            <View
              className="absolute inset-0 items-center justify-center"
              style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
            >
              <ActivityIndicator color={WHITE} />
            </View>
          )}
        </View>
        <View
          className="absolute items-center justify-center rounded-full"
          style={{
            right: -2,
            bottom: -2,
            width: 32,
            height: 32,
            backgroundColor: Palette.accent,
          }}
        >
          <Icon name={CAMERA_ICON} size="sm" color={WHITE} />
        </View>
      </Pressable>
      <Pressable onPress={() => void changePhoto()} disabled={isUploading} hitSlop={8}>
        <ThemedText type="smallBold" style={{ color: Palette.accent }}>
          {isUploading ? 'Uploading…' : 'Change photo'}
        </ThemedText>
      </Pressable>
      {photoError && <Text className="text-center text-sm text-error">{photoError}</Text>}
      {isPhotoSaved && (
        <Text className="text-center text-sm text-success" accessibilityLiveRegion="polite">
          Photo updated.
        </Text>
      )}
    </View>
  );
}

/**
 * Student "Edit profile": photo, the account details the student may edit
 * (preferred name → account first name, mobile number), read-only email and
 * guardian contact, and the school-register fields the student can't change.
 * Name/phone save through the shared `useUpdateProfileForm` (also used by
 * the parent app's `EditProfileForm`); the last name isn't shown and is
 * re-sent unchanged from the loaded profile.
 */
export function StudentProfileEditor() {
  const theme = useTheme();
  const { user, initials } = useStudentIdentity();
  const { data: studentProfile } = useGetMyStudentProfileQuery();
  const {
    control,
    onSubmit,
    isSubmitting,
    isSaved,
    profile,
    isProfileLoading,
    isProfileError,
    formState: { errors },
  } = useUpdateProfileForm();

  const guardianContact = getGuardianContact(studentProfile);
  const schoolRows = [
    { label: 'NEMIS ID', value: studentProfile?.nemisId },
    { label: 'Grade / class', value: getCurrentClassName(studentProfile) },
    { label: 'School', value: studentProfile?.institution?.name ?? user?.institution?.name },
  ].filter((row): row is { label: string; value: string } => !!row.value);

  const inputStyle = { color: theme.text, fontSize: 16, paddingVertical: 2 };

  return (
    <QueryState
      isLoading={isProfileLoading}
      isError={isProfileError}
      loadingFallback={<SkeletonProfile fields={4} />}
    >
      <View className="gap-2 pb-8">
        <ProfilePhoto imageUrl={user?.profileImageUrl} initials={initials} />

        <SectionCaption className="mt-3">YOUR DETAILS</SectionCaption>
        <View className="overflow-hidden rounded-card" style={{ backgroundColor: theme.card }}>
          <DetailRow label="Preferred name" divider>
            <Controller
              control={control}
              name="firstName"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  editable={!isSubmitting}
                  autoCapitalize="words"
                  accessibilityLabel="Preferred name"
                  style={inputStyle}
                />
              )}
            />
            {errors.firstName?.message && (
              <Text className="text-sm text-error">{errors.firstName.message}</Text>
            )}
          </DetailRow>
          <DetailRow label="Email address" divider>
            <ThemedText selectable>{profile?.email}</ThemedText>
          </DetailRow>
          <DetailRow label="Mobile number" divider>
            <Controller
              control={control}
              name="phoneNumber"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  editable={!isSubmitting}
                  keyboardType="phone-pad"
                  placeholder="Not provided"
                  placeholderTextColor={theme.text}
                  accessibilityLabel="Mobile number"
                  style={inputStyle}
                />
              )}
            />
          </DetailRow>
          <DetailRow label="Guardian contact" divider={false}>
            <ThemedText>{guardianContact ?? 'Not provided'}</ThemedText>
          </DetailRow>
        </View>

        {schoolRows.length > 0 && (
          <>
            <SectionCaption className="mt-4">MANAGED BY YOUR SCHOOL</SectionCaption>
            <View
              className="overflow-hidden rounded-card pb-3"
              style={{ backgroundColor: theme.card }}
            >
              {schoolRows.map((row) => (
                <View
                  key={row.label}
                  className="flex-row items-center gap-3 px-4 pt-3"
                  accessible
                  accessibilityLabel={`${row.label}: ${row.value}. Managed by your school.`}
                >
                  <View className="flex-1 gap-0.5">
                    <ThemedText type="small" themeColor="textSecondary" style={{ fontSize: 12 }}>
                      {row.label}
                    </ThemedText>
                    <ThemedText type="smallBold">{row.value}</ThemedText>
                  </View>
                  <Icon name={LOCK_ICON} size="sm" color={theme.textSecondary} />
                </View>
              ))}
              <ThemedText type="small" themeColor="textSecondary" className="mt-3 px-4">
                These details come from the school register. Contact your school administrator to
                correct them.
              </ThemedText>
            </View>
          </>
        )}

        {errors.root?.message && (
          <Text className="mt-2 text-center text-sm text-error">{errors.root.message}</Text>
        )}
        {isSaved && (
          <Text className="mt-2 text-center text-sm text-success" accessibilityLiveRegion="polite">
            Profile updated.
          </Text>
        )}
        <Button label="Save changes" onPress={onSubmit} isLoading={isSubmitting} className="mt-3" />
      </View>
    </QueryState>
  );
}
