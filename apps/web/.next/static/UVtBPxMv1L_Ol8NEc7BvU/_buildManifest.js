self.__BUILD_MANIFEST = {
  "__rewrites": {
    "afterFiles": [],
    "beforeFiles": [
      {
        "has": [
          {
            "type": "header",
            "key": "next-url",
            "value": "/.*"
          }
        ],
        "source": "/login",
        "destination": "/(.)login"
      },
      {
        "has": [
          {
            "type": "header",
            "key": "next-url",
            "value": "/.*"
          }
        ],
        "source": "/signup",
        "destination": "/(.)signup"
      }
    ],
    "fallback": []
  },
  "sortedPages": [
    "/_app",
    "/_error"
  ]
};self.__BUILD_MANIFEST_CB && self.__BUILD_MANIFEST_CB()