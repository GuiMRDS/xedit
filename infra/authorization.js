function can(user, feature, resource) {
  let authorized = false;

  if (user.features.includes(feature)) {
    authorized = true;
  }

  if (feature === "update:user" && resource) {
    authorized = false;

    if (user.id === resource.id || can(user, "update:user:others")) {
      authorized = true;
    }
  }

  return authorized;
}

function filterOutput(user, feature, insecureValues) {
  if (feature === "read:user") {
    return {
      id: insecureValues.id,
      username: insecureValues.username,
      features: insecureValues.features,
      created_at: insecureValues.created_at,
      update_at: insecureValues.update_at,
    };
  }

  if (feature === "read:user:self") {
    if (user.id === insecureValues.id) {
      return {
        id: insecureValues.id,
        username: insecureValues.username,
        email: insecureValues.email,
        features: insecureValues.features,
        created_at: insecureValues.created_at,
        update_at: insecureValues.update_at,
      };
    }
  }

  if (feature === "read:session") {
    if (user.id === insecureValues.user_id) {
      return {
        id: insecureValues.id,
        token: insecureValues.token,
        user_id: insecureValues.user_id,
        username: insecureValues.username,
        created_at: insecureValues.created_at,
        update_at: insecureValues.update_at,
      };
    }
  }

  if (feature === "read:activation_token") {
    return {
      id: insecureValues.id,
      user_id: insecureValues.user_id,
      created_at: insecureValues.created_at,
      update_at: insecureValues.update_at,
      expires_at: insecureValues.expires_at,
      used_at: insecureValues.used_at,
    };
  }

  if (feature === "read:migration") {
    return insecureValues.map((migration) => {
      return {
        path: migration.path,
        name: migration.name,
        timestamp: migration.timestamp,
      };
    });
  }
}

const authorization = {
  can,
  filterOutput,
};

export default authorization;
